// export default function Loading() {
//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//       <div className="text-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//         <p className="text-gray-600">Loading practice rooms...</p>
//       </div>
//     </div>
//   )
// }

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="text-center mb-8">
            <div className="w-80 h-8 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
            <div className="w-96 h-4 bg-gray-200 rounded mx-auto animate-pulse"></div>
          </div>

          {/* Tab Navigation Skeleton */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-28 h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Loading Content */}
          <div className="space-y-6">
            {/* Search Cards Skeleton */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg border">
                <div className="space-y-4">
                  <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-full h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border">
                <div className="space-y-4">
                  <div className="w-40 h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex space-x-2">
                    <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-16 h-10 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading Indicator */}
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading practice rooms...</p>
              <p className="text-sm text-gray-500 mt-2">Connecting to server and fetching available sessions</p>
            </div>

            {/* Room Cards Skeleton */}
            <div className="space-y-4">
              <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
              
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
                        <div className="flex space-x-2">
                          <div className="w-16 h-5 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-20 h-5 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-28 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                    
                    <div className="ml-6">
                      <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}