function Table({ 
  columns, 
  data, 
  loading = false,
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectRow
}) {
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div data-name="table" className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {selectable && (
              <th scope="col" className="px-6 py-3">
                <input 
                  type="checkbox"
                  checked={selectedRows.length === data.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onSelectRow(data.map(row => row.id));
                    } else {
                      onSelectRow([]);
                    }
                  }}
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr 
              key={row.id || rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            >
              {selectable && (
                <td className="px-6 py-4">
                  <input 
                    type="checkbox"
                    checked={selectedRows.includes(row.id)}
                    onChange={() => {
                      if (selectedRows.includes(row.id)) {
                        onSelectRow(selectedRows.filter(id => id !== row.id));
                      } else {
                        onSelectRow([...selectedRows, row.id]);
                      }
                    }}
                  />
                </td>
              )}
              {columns.map((column) => (
                <td 
                  key={column.key} 
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Tidak ada data
        </div>
      )}
    </div>
  );
}
