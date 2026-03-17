import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Plus, Trash2, Search, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

export default function RecipeBuilder({ notify }: { notify: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void }) {
    const [recipes, setRecipes] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Estado para la receta seleccionada/nueva
    const [activeRecipe, setActiveRecipe] = useState<any>(null);
    const [recipeIngredients, setRecipeIngredients] = useState<any[]>([]);
    
    // Formularios
    const [newRecipeName, setNewRecipeName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [recipesData, productsData] = await Promise.all([
                supabase.from("recipes").select("*").order("nombre"),
                supabase.from("products").select("*").order("nombre")
            ]);
            
            if (recipesData.data) setRecipes(recipesData.data);
            if (productsData.data) setProducts(productsData.data);
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadRecipeIngredients = async (recipeId: string) => {
        const { data, error } = await supabase
            .from("recipe_ingredients")
            .select("*, products(nombre, unidad, costo_unitario)")
            .eq("recipe_id", recipeId);
            
        if (!error && data) {
            setRecipeIngredients(data);
        }
    };

    const createRecipe = async () => {
        if (!newRecipeName.trim()) return;
        
        const { data, error } = await supabase
            .from("recipes")
            .insert([{ nombre: newRecipeName.trim() }])
            .select()
            .single();
            
        if (!error && data) {
            setRecipes([...recipes, data]);
            setNewRecipeName("");
            setActiveRecipe(data);
            setRecipeIngredients([]);
        } else {
            notify("Error al crear receta. Podría ya existir con ese nombre.", "error");
        }
    };

    const addIngredient = async (product: any) => {
        if (!activeRecipe) return;
        
        // Evitar duplicados
        if (recipeIngredients.some(ri => ri.product_id === product.id)) {
            notify("Este ingrediente ya está en la receta", "warning");
            return;
        }

        const { data, error } = await supabase
            .from("recipe_ingredients")
            .insert([{
                recipe_id: activeRecipe.id,
                product_id: product.id,
                cantidad: 1 // Por defecto 1
            }])
            .select("*, products(nombre, unidad, costo_unitario)")
            .single();

        if (error) {
            console.error("Error al añadir ingrediente:", error);
            notify("No se pudo añadir el ingrediente.", "error");
        } else if (data) {
            setRecipeIngredients([...recipeIngredients, data]);
        }
    };

    const updateIngredientQuantity = async (id: string, newCantidad: string) => {
        // Actualizar el estado local inmediatamente (incluso si es vacío) para que sea fluido
        setRecipeIngredients(prev => 
            prev.map(ri => ri.id === id ? { ...ri, cantidad: newCantidad } : ri)
        );

        const cant = parseFloat(newCantidad);
        if (isNaN(cant) || cant <= 0) return;

        // Solo persistir en DB si es un número válido
        const { error } = await supabase
            .from("recipe_ingredients")
            .update({ cantidad: cant })
            .eq("id", id);

        if (error) {
            console.error("Error persistiendo cantidad:", error);
        }
    };

    const removeIngredient = async (id: string) => {
        const { error } = await supabase
            .from("recipe_ingredients")
            .delete()
            .eq("id", id);

        if (!error) {
            setRecipeIngredients(prev => prev.filter(ri => ri.id !== id));
        }
    };

    const deleteRecipe = async (id: string) => {
        if (!confirm("¿Seguro que deseas eliminar esta receta?")) return;
        
        const { error } = await supabase
            .from("recipes")
            .delete()
            .eq("id", id);
            
        if (!error) {
            setRecipes(prev => prev.filter(r => r.id !== id));
            if (activeRecipe?.id === id) {
                setActiveRecipe(null);
                setRecipeIngredients([]);
            }
        }
    };

    const filteredProducts = products.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-cyan-600 size-8" /></div>;

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Recetario (BOM)</h2>
                    <p className="text-sm text-slate-500 mt-1">Configura cómo se componen los platos vendidos en Loggro.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Panel Izquierdo: Lista de Recetas */}
                <div className="lg:col-span-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-180px)]">
                    <h3 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-wider">Mis Recetas</h3>
                    
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            placeholder="Nueva receta..."
                            value={newRecipeName}
                            onChange={(e) => setNewRecipeName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && createRecipe()}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                        />
                        <button onClick={createRecipe} className="bg-cyan-600 text-white p-2 rounded-lg hover:bg-cyan-700">
                            <Plus size={18} />
                        </button>
                    </div>

                    <div className="overflow-y-auto flex-1 space-y-2 pr-2">
                        {recipes.map(recipe => (
                            <div 
                                key={recipe.id}
                                onClick={() => {
                                    setActiveRecipe(recipe);
                                    loadRecipeIngredients(recipe.id);
                                }}
                                className={cn(
                                    "p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all",
                                    activeRecipe?.id === recipe.id 
                                        ? "bg-cyan-50 border-cyan-300 text-cyan-800" 
                                        : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-600"
                                )}
                            >
                                <span className="text-sm font-bold truncate pr-2" title={recipe.nombre}>{recipe.nombre}</span>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); deleteRecipe(recipe.id); }}
                                    className="text-slate-400 hover:text-rose-500"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Panel Central: Constructor de la Receta */}
                <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[calc(100vh-180px)] flex flex-col">
                    {!activeRecipe ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <Plus size={48} className="mb-4 opacity-20" />
                            <p className="font-medium text-lg text-slate-500">Selecciona o crea una receta</p>
                            <p className="text-sm">Para comenzar a agregar ingredientes</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 pb-4 border-b border-slate-100">
                                <h3 className="text-xl font-black text-slate-800">{activeRecipe.nombre}</h3>
                                <p className="text-sm text-slate-500">Define qué se debe descontar cuando se venda este producto.</p>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                                {recipeIngredients.length === 0 ? (
                                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm font-medium">
                                        Esta receta no tiene ingredientes. No descontará nada del inventario. Usa el panel derecho para agregar.
                                    </div>
                                ) : (
                                    recipeIngredients.map(ing => (
                                        <div key={ing.id} className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-800">{ing.products?.nombre}</p>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center rounded-lg border border-slate-300 bg-white overflow-hidden">
                                                    <input 
                                                        type="number" 
                                                        value={ing.cantidad}
                                                        step="0.01"
                                                        onChange={(e) => updateIngredientQuantity(ing.id, e.target.value)}
                                                        className="w-20 text-center py-2 text-sm font-bold focus:outline-none"
                                                    />
                                                    <div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 border-l border-slate-200">
                                                        {ing.products?.unidad || "UND"}
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => removeIngredient(ing.id)}
                                                    className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Panel Derecho: Buscador de Bodega */}
                <div className="lg:col-span-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-180px)]">
                    <h3 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-wider">Bodega (Materia Prima)</h3>
                    
                    <div className="relative mb-4">
                        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={!activeRecipe}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                        />
                    </div>

                    <div className="overflow-y-auto flex-1 space-y-2 pr-2">
                        {filteredProducts.map(product => (
                            <div 
                                key={product.id}
                                className={cn(
                                    "p-3 rounded-xl border flex justify-between items-center transition-all",
                                    !activeRecipe ? "opacity-50 grayscale" : "bg-white border-slate-100 hover:border-emerald-200 hover:shadow-sm"
                                )}
                            >
                                <div className="truncate pr-2">
                                    <p className="text-sm font-bold text-slate-700 truncate" title={product.nombre}>{product.nombre}</p>
                                    <p className="text-[10px] text-slate-400 uppercase">{product.unidad || "UND"}</p>
                                </div>
                                <button 
                                    disabled={!activeRecipe}
                                    onClick={() => addIngredient(product)}
                                    className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg hover:bg-emerald-100 hover:text-emerald-700 disabled:opacity-50 transition-colors"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

