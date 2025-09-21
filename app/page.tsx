import ProductGrid from '@/components/ProductGrid';
import SearchAndFilter from '@/components/SearchAndFilter';

export default function Home() {
  return (
    <div className="min-h-screen bg-green-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            🥬 Sayuran Segar Nurul Ashri 🌱
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-green-100">
            Sayuran segar langsung dari kebun ke meja Anda
          </p>
          <div className="flex justify-center items-center mb-6 space-x-4">
            <span className="bg-yellow-400 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              🌾 Saling membantu
            </span>
            
            <span className="bg-yellow-400 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              💚 Langsung dari Petani
            </span>
          </div>
          <a
            href="#products"
            className="inline-block bg-yellow-400 text-green-800 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors shadow-lg"
          >
            🛒 Belanja Sekarang
          </a>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-800 mb-4">
              🥕 Sayuran Segar Pilihan 🥬
            </h2>
            <p className="text-lg text-green-600 max-w-2xl mx-auto">
              Dipetik langsung dari kebun kami. <p>Segar, bergizi, dan penuh cinta untuk keluarga Anda. 
              <p>-petani-</p> </p>
            </p>
          </div>
          
          <SearchAndFilter />
          <ProductGrid />
        </div>
      </section>
    </div>
  );
}
