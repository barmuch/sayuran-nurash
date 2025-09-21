'use client';

import { useState } from 'react';
import { HelpCircle, X, ExternalLink, Copy, CheckCircle } from 'lucide-react';

interface ImageHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageHelpModal({ isOpen, onClose }: ImageHelpModalProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const imageGuides = [
    {
      title: '📸 Unsplash (Rekomendasi)',
      description: 'Foto berkualitas tinggi gratis dari fotografer profesional',
      steps: [
        'Buka website: https://unsplash.com',
        'Cari gambar sayuran dengan kata kunci seperti "vegetables", "tomato", "lettuce"',
        'Klik gambar yang diinginkan',
        'Klik tombol "Download" (pilih ukuran "Small" atau "Regular")',
        'Copy URL lengkap dari browser atau klik kanan → "Copy image address"',
        'Paste ke field Image URL'
      ],
      example: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      url: 'https://unsplash.com/s/photos/vegetables'
    },
    {
      title: '🎨 Picsum Photos',
      description: 'Generator gambar acak yang mudah dan cepat (cadangan)',
      steps: [
        'Buka website: https://picsum.photos',
        'Gunakan format: https://picsum.photos/500/400?random=ANGKA',
        'Ganti ANGKA dengan nomor unik (contoh: 1, 2, 3, dst)',
        'Copy link dan paste ke field Image URL'
      ],
      example: 'https://picsum.photos/500/400?random=123',
      url: 'https://picsum.photos'
    },
    {
      title: '🖼️ Imgur',
      description: 'Upload gambar sendiri dan dapatkan link',
      steps: [
        'Buka website: https://imgur.com',
        'Klik "New post" atau drag & drop gambar',
        'Upload foto sayuran Anda',
        'Klik kanan pada gambar yang sudah di-upload',
        'Pilih "Copy image address" dan paste ke field'
      ],
      example: 'https://i.imgur.com/ABC123.jpg',
      url: 'https://imgur.com'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-green-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <HelpCircle className="text-green-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-800">
                📷 Panduan Mendapatkan Link Gambar
              </h2>
              <p className="text-green-600 text-sm">
                Ikuti langkah-langkah berikut untuk mendapatkan URL gambar sayuran
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid gap-6">
            {imageGuides.map((guide, index) => (
              <div key={index} className="border border-green-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      {guide.title}
                    </h3>
                    <p className="text-green-600 text-sm mb-3">
                      {guide.description}
                    </p>
                  </div>
                  <a
                    href={guide.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm hover:bg-green-200 transition-colors"
                  >
                    <ExternalLink size={14} />
                    <span>Buka</span>
                  </a>
                </div>

                {/* Steps */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">📝 Langkah-langkah:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    {guide.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="leading-relaxed">{step}</li>
                    ))}
                  </ol>
                </div>

                {/* Example */}
                <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-green-400">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      💡 Contoh URL:
                    </span>
                    <button
                      onClick={() => copyToClipboard(guide.example, `example-${index}`)}
                      className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-xs"
                    >
                      {copiedText === `example-${index}` ? (
                        <>
                          <CheckCircle size={14} />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <code className="text-xs text-green-800 bg-white px-2 py-1 rounded border block">
                    {guide.example}
                  </code>
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
              💡 Tips Penting:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
              <li>Pastikan URL gambar berakhiran .jpg, .png, .jpeg, atau .webp</li>
              <li>Gunakan gambar dengan resolusi minimal 400x300 untuk hasil terbaik</li>
              <li>Hindari gambar yang terlalu besar (&gt;2MB) agar loading cepat</li>
              <li>Pilih gambar sayuran yang segar dan menarik</li>
            </ul>
          </div>

          {/* Quick Unsplash URLs */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
              🚀 URL Unsplash Siap Pakai:
            </h4>
            <div className="grid gap-2">
              {[
                { name: '🍅 Tomat Segar', url: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
                { name: '🥬 Selada Hijau', url: 'https://images.unsplash.com/photo-1622034788147-b0267596443b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
                { name: '🥕 Wortel Organik', url: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
                { name: '🌽 Jagung Manis', url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border">
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  <button
                    onClick={() => copyToClipboard(item.url, `quick-${idx}`)}
                    className="flex items-center space-x-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                  >
                    {copiedText === `quick-${idx}` ? (
                      <CheckCircle size={12} />
                    ) : (
                      <Copy size={12} />
                    )}
                    <span>{copiedText === `quick-${idx}` ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-green-100 bg-green-50">
          <button
            onClick={onClose}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            ✅ Mengerti, Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
}
