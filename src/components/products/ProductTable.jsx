'use client';

import Link from 'next/link';

export default function ProductTable({ products, onEdit, onDelete }) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="hidden md:block overflow-hidden bg-white shadow-sm border border-gray-200 rounded-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-gray-700 font-semibold">
            <tr>
              <th scope="col" className="px-4 py-3.5 w-16">
                Image
              </th>
              <th scope="col" className="px-4 py-3.5">
                Title
              </th>
              <th scope="col" className="px-4 py-3.5">
                Category
              </th>
              <th scope="col" className="px-4 py-3.5">
                Price
              </th>
              <th scope="col" className="px-4 py-3.5">
                Rating
              </th>
              <th scope="col" className="px-4 py-3.5">
                Stock
              </th>
              <th scope="col" className="px-4 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {products.map((product) => {
              const formattedPrice = `$${Number(product.price || 0).toFixed(2)}`;
              const thumbnail =
                product.thumbnail ||
                (product.images && product.images[0]) ||
                '';

              return (
                <tr
                  key={product.id}
                  className="even:bg-gray-50/60 hover:bg-gray-100/80 transition-colors"
                >
                  {/* 1. Image (40x40) */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={product.title}
                          className="w-10 h-10 object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </div>
                  </td>

                  {/* 2. Title (links to /products/[id]) */}
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">
                    <Link
                      href={`/products/${product.id}`}
                      className="hover:text-indigo-600 hover:underline transition-colors block truncate"
                      title={product.title}
                    >
                      {product.title}
                    </Link>
                    {product.brand && (
                      <span className="text-xs text-gray-400 block truncate">
                        {product.brand}
                      </span>
                    )}
                  </td>

                  {/* 3. Category */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize border border-gray-200">
                      {product.category || 'Uncategorized'}
                    </span>
                  </td>

                  {/* 4. Price ($xx.xx) */}
                  <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">
                    {formattedPrice}
                  </td>

                  {/* 5. Rating */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <svg
                        className="w-3.5 h-3.5 fill-current text-amber-500"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {Number(product.rating || 0).toFixed(1)}
                    </span>
                  </td>

                  {/* 6. Stock */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        product.stock <= 5
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : product.stock <= 20
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {product.stock} in stock
                    </span>
                  </td>

                  {/* 7. Edit & Delete icon buttons */}
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit && onEdit(product)}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
