import ProductGrid from '@/components/ProductGrid';
import SearchAndFilter from '@/components/SearchAndFilter';

export default function Home() {
  return (
    <div className="min-h-screen bg-green-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight">
            🥬 Sayuran Segar<br className="sm:hidden" /> Nurul Ashri 🌱
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-green-100 px-2">
            Sayuran segar langsung dari kebun ke meja Anda
          </p>
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mb-6 px-2">
            <span className="bg-yellow-400 text-green-800 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
              🌾 Saling membantu
            </span>
            <span className="bg-yellow-400 text-green-800 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
              💚 Langsung dari Petani
            </span>
          </div>
          <a
            href="#products"
            className="inline-block bg-yellow-400 text-green-800 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors shadow-lg text-sm sm:text-base"
          >
            🛒 Belanja Sekarang
          </a>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-800 mb-3 sm:mb-4">
              🥕 Sayuran Segar Pilihan 🥬
            </h2>
            <div className="text-sm sm:text-base md:text-lg text-green-600 max-w-2xl mx-auto px-4">
              <p>Dipetik langsung dari kebun kami. Segar, bergizi, dan penuh cinta untuk keluarga Anda.</p>
              <p className="text-xs sm:text-sm italic mt-2">- petani -</p>
            </div>
          </div>
          
          <SearchAndFilter />
          <ProductGrid />
        </div>
      </section>

      {/* Lokasi & Maps */}
      <section className="pb-8 sm:pb-12 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg border p-4 sm:p-6 shadow-sm max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-green-800">📍 Lokasi Kami</h2>
              <a
                href="https://maps.app.goo.gl/wB9G8jFBr588oaqP8"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm px-3 py-1.5 rounded bg-green-100 text-green-800 hover:bg-green-200 transition-colors font-medium"
              >
                Buka Maps
              </a>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4 leading-relaxed">
              Jl. Ring Road Utara, Condongcatur, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55283
            </p>
            <div className="w-full rounded-lg overflow-hidden border h-48 sm:h-56 md:h-72">
              <iframe
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent('Jl. Ring Road Utara, Condongcatur, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55283')}&output=embed`}
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
