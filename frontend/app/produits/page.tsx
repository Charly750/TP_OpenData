"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import SearchBar from "@/app/components/SearchBar"
import { getProduct } from "@/app/lib/data"
import type { Product } from "@/app/types"
import { logout } from "../lib/auth"
import BarcodeScannerModal from "../barcode-scanner/page"
import { Search, LogOut, Scan, Filter, ChevronLeft, ChevronRight, ExternalLink, Loader2 } from "lucide-react"

export default function Produits() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [searchType, setSearchType] = useState<string>("category")
  const [filterNutriscore, setFilterNutriscore] = useState<string >("")
  const [loading, setLoading] = useState<boolean>(true)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [isScannerOpen, setScannerOpen] = useState(false)
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    checkAuth()
    
    if (searchTerm.trim() === "") {
      loadProducts()
    }
  }, [router, currentPage, searchTerm, filterNutriscore]) // Ajouté filterNutriscore comme dépendance
  
  const checkAuth = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    if (!isLoggedIn) {
      router.push("/")
      return false
    }
    return true
  }
  
  const loadProducts = async () => {
    if (checkAuth()) {
      try {
        setLoading(true)
        const data = await getProduct({
          sort: "popularity_key",
          nutriscore: filterNutriscore,
          page: currentPage,
        })
        setProducts(data.products || [])
        setFilteredProducts(data.products || [])
        if (data.pagination) {
          setTotalPages(data.pagination)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des produits", error)
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchTerm.trim() === "") return

      setLoading(true)
      try {
        const token = localStorage.getItem("authToken")
        const response = await fetch(`http://localhost:5000/search/${searchType}/${encodeURIComponent(searchTerm)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) throw new Error("Erreur recherche")

        const data = await response.json()
        setProducts(data.products || [])
        setFilteredProducts(data.products || [])
        setTotalPages(1)
      } catch (error) {
        console.error("Erreur recherche : ", error)
        setProducts([])
        setFilteredProducts([])
      } finally {
        setLoading(false)
      }
    }

    if (searchTerm.trim() !== "") {
      fetchSearchResults()
    }
  }, [searchTerm, searchType])

  useEffect(() => {
    let result = [...products]

    if (filterNutriscore !== "") {
      // Correction de la condition ici: vérifier si filterNutriscore n'est pas vide
      result = result.filter((product) => product.nutrition_grades === filterNutriscore)
    }

    setFilteredProducts(result)
  }, [filterNutriscore, products])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterNutriscore(event.target.value)
    // Suppression de l'appel à loadProducts() ici, car le useEffect avec les dépendances s'en chargera
  }

  const handleSearchTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchType(event.target.value)
    setSearchTerm("")
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const renderPageNumbers = () => {
    if (totalPages <= 1) return null

    const pages = []
    const maxPagesToShow = 5
    let start = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    const end = Math.min(totalPages, start + maxPagesToShow - 1)

    if (end - start < maxPagesToShow - 1) {
      start = Math.max(1, end - maxPagesToShow + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${currentPage === i
              ? "bg-emerald-600 text-white font-semibold"
              : "bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50"
            }`}
        >
          {i}
        </button>,
      )
    }

    return pages
  }

  // 🔄 Récupérer un produit par code-barres
  const fetchProductByBarcode = async (code: string) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("authToken")

      const response = await fetch(`http://localhost:5000/product/${code}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        alert("Produit non trouvé")
        throw new Error("Produit non trouvé")
      }

      const data = await response.json()

      if (data && data.product) {
        setProducts([data.product])
        setFilteredProducts([data.product])
        setTotalPages(1)
        setSearchTerm("")
      } else {
        setProducts([])
        setFilteredProducts([])
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du produit :", error)
      setProducts([])
      setFilteredProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour obtenir la couleur du Nutriscore
  const getNutriscoreColor = (score: string) => {
    const colors = {
      a: "bg-green-500",
      b: "bg-light-green-500",
      c: "bg-yellow-500",
      d: "bg-orange-500",
      e: "bg-red-500",
    }
    return colors[score.toLowerCase() as keyof typeof colors] || "bg-gray-400"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-emerald-800">Produits alimentaires</h1>
            <p className="text-emerald-600 mt-1">Découvrez des produits sains et écologiques</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setScannerOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-full transition-all shadow-md hover:shadow-lg"
            >
              <Scan size={18} />
              <span>Scanner un code-barres</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-medium py-2.5 px-4 rounded-full transition-all"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </header>

        {/* Scanner Modal */}
        <BarcodeScannerModal
          isOpen={isScannerOpen}
          onClose={() => setScannerOpen(false)}
          onScan={(result) => {
            console.log("Scanned code: ", result)
            setScannedCode(result)
            fetchProductByBarcode(result)
            setScannerOpen(false)
          }}
        />

        {/* Scanned Code Display */}
        {scannedCode && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-emerald-800">
              Code scanné : <strong>{scannedCode}</strong>
            </p>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="w-full md:w-1/2">
              <label className="block mb-2 text-sm font-medium text-gray-700">Rechercher un produit</label>
              <div className="relative">
                <SearchBar onSearch={handleSearch} />

              </div>
            </div>

            <div className="w-full md:w-1/4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Recherche par</label>
              <select
                value={searchType}
                onChange={handleSearchTypeChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              >
                <option value="category">Par Catégorie</option>
                <option value="brand">Par Marque</option>
              </select>
            </div>

            <div className="w-full md:w-1/4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Filtrer par</label>
              <select
                value={filterNutriscore}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              >
                <option value="">Tous les Produits</option>
                <option value="a">Nutriscore A</option>
                <option value="e">Nutriscore E</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 rounded-lg text-gray-700"
          >
            <Filter size={18} />
            {isFilterOpen ? "Masquer les filtres" : "Afficher les filtres"}
          </button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
            <p className="text-emerald-800 font-medium">Chargement des produits...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={product.image_url || "/no_picture.png"}

                      alt={product.product_name || "Produit"}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold ${getNutriscoreColor(product.nutrition_grades)}`}
                      >
                        {product.nutrition_grades?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 line-clamp-2">{product.product_name}</h3>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-xs text-gray-500">Nova</p>
                        <p className="text-sm font-medium">{product.nova_group || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-xs text-gray-500">Ecoscore</p>
                        <p className="text-sm font-medium">{product.ecoscore_grade?.toUpperCase() || "N/A"}</p>
                      </div>
                    </div>

                    {product.stores && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Disponible chez</p>
                        <p className="text-sm text-gray-700 bg-emerald-50 px-2 py-1 rounded inline-block">
                          {product.stores}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full text-emerald-600 hover:text-emerald-700 font-medium py-2 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <ExternalLink size={16} />
                        Voir les détails
                      </a>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-gray-100 rounded-full p-4 mb-4">
                  <Search className="text-gray-400" size={32} />
                </div>
                <p className="text-gray-600 text-lg font-medium">Aucun produit trouvé</p>
                <p className="text-gray-500 mt-2">Essayez de modifier vos critères de recherche</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {searchTerm.trim() === "" && totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center mt-10 gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 bg-white text-emerald-600 rounded-full border border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-50 transition-colors"
            >
              <ChevronLeft size={16} />
              Précédent
            </button>

            <div className="flex gap-2 mx-2">{renderPageNumbers()}</div>

            <button
              onClick={() => setCurrentPage((prev) => (totalPages && prev < totalPages ? prev + 1 : prev))}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 px-4 py-2 bg-white text-emerald-600 rounded-full border border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-50 transition-colors"
            >
              Suivant
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
