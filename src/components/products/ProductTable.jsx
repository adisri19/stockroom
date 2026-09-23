'use client';

import Link from 'next/link';

export default function ProductTable({ products, onEdit, onDelete }) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="hidden md:block overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800/80 text-left text-sm">
          <thead className="bg-slate-950/70 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th scope="col" className="px-5 py-4 w-16">
                Product
              </th>
              <th scope="col" className="px-5 py-4">
                Details
              </th>
              <th scope="col" className="px-5 py-4">
                Category
              </th>
              <th scope="col" className="px-5 py-4">
                Price
              </th>
              <th scope="col" className="px-5 py-4">
                Rating
              </th>
              <th scope="col" className="px-5 py-4">
                Stock Status
              </th>
              <th scope="col" className="px-5 py-4 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-transparent">
            {products.map((product) => {
              const formattedPrice = `$${Number(product.price || 0).toFixed(2)}`;
              const thumbnail =
                product.thumbnail ||
                (product.images && product.images[0]) ||
                '';

              return (
                <tr
                  key={product.id}
                  className="even:bg-slate-900/30 hover:bg-indigo-950/25 transition-all duration-150 group"
                >
                  {/* 1. Image (40x40) with Zoom on Hover */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="w-11 h-11 rounded-xl bg-slate-950/80 border border-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0 relative group-hover:border-indigo-500/40 transition-colors">
                      {thumbnail ? (
                        <>
                          <img
                            src={thumbnail}
                            alt={product.title}
                            className="w-11 h-11 object-cover group-hover:scale-110 transition-transform duration-200"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.parentElement.querySelector('.img-fallback');
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                          <div className="img-fallback hidden w-full h-full flex items-center justify-center bg-slate-950 text-slate-500">
                            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </>
                      ) : (
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                  </td>

                  {/* 2. Title & Brand */}
                  <td className="px-5 py-3.5 max-w-xs">
                    <Link
                      href={`/products/${product.id}`}
                      className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors block truncate"
                      title={product.title}
                    >
                      {product.title}
                    </Link>
                    {product.brand && (
                      <span className="text-xs text-slate-400 font-medium block truncate">
                        {product.brand}
                      </span>
                    )}
                  </td>

                  {/* 3. Category Badge */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-500/10 text-violet-300 capitalize border border-violet-500/20">
                      {product.category || 'Uncategorized'}
                    </span>
                  </td>

                  {/* 4. Price */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="font-bold text-white tracking-tight text-base">
                      {formattedPrice}
                    </span>
                  </td>

                  {/* 5. Rating Badge */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      <svg
                        className="w-3.5 h-3.5 fill-current text-amber-400"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {Number(product.rating || 0).toFixed(1)}
                    </span>
                  </td>

                  {/* 6. Stock Status */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        product.stock <= 5
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : product.stock <= 20
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          product.stock <= 5
                            ? 'bg-rose-400 animate-pulse'
                            : product.stock <= 20
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                      />
                      {product.stock} units
                    </span>
                  </td>

                  {/* 7. Actions */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit && onEdit(product)}
                        className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/20 rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        aria-label={`Edit ${product.title}`}
                        title="Edit product"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete && onDelete(product)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                        aria-label={`Delete ${product.title}`}
                        title="Delete product"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
