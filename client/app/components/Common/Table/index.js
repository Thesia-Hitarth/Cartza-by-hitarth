import React, { useState, useMemo } from 'react';
import Button from '../Button';

const indication = () => {
  return 'Oops! No data now! Please try again!';
};

const Table = ({
  data = [],
  columns = [],
  striped = true,
  hover = true,
  condensed = false,
  csv = false,
  search = false,
  clickAction,
  isRowEvents = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Handle Search Filtering
  const filteredData = useMemo(() => {
    if (!search || !searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(row => {
      return columns.some(col => {
        const val = row[col.dataField];
        if (val == null) return false;
        return String(val).toLowerCase().includes(term);
      });
    });
  }, [data, columns, search, searchTerm]);

  // Handle CSV Export
  const exportToCSV = () => {
    if (!data || data.length === 0) return;
    const headers = columns.map(c => c.text).join(',');
    const rows = data.map(row => 
      columns.map(col => {
        const val = row[col.dataField];
        return val != null ? `"${String(val).replace(/"/g, '""')}"` : '""';
      }).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tw-w-full tw-overflow-hidden">
      <div className="tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-center tw-gap-4 tw-mb-4">
        {csv && (
          <Button
            variant="secondary"
            size="md"
            text="Export CSV"
            onClick={exportToCSV}
            className="tw-whitespace-nowrap"
          />
        )}
        {search && (
          <div className="tw-relative tw-w-full sm:tw-w-64">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="tw-w-full tw-px-3 tw-py-2 tw-text-sm tw-border tw-border-border tw-rounded tw-bg-cream tw-text-ink focus:tw-outline-none focus:tw-ring-1 focus:tw-ring-accent"
            />
          </div>
        )}
      </div>

      <div className="tw-w-full tw-overflow-x-auto tw-border tw-border-border tw-rounded">
        <table className="tw-w-full tw-text-left tw-border-collapse tw-font-body">
          <thead className="tw-bg-surface tw-text-ink tw-text-xs tw-uppercase tw-tracking-wider tw-border-b tw-border-border">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.dataField || idx}
                  className={`tw-px-4 ${condensed ? 'tw-py-2' : 'tw-py-3'} tw-font-semibold`}
                >
                  {col.text}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="tw-divide-y tw-divide-border tw-text-sm">
            {filteredData.length > 0 ? (
              filteredData.map((row, rowIdx) => (
                <tr
                  key={row._id || rowIdx}
                  onClick={() => isRowEvents && clickAction && clickAction(row._id, rowIdx)}
                  className={`
                    ${striped && rowIdx % 2 === 1 ? 'tw-bg-surface/30' : 'tw-bg-transparent'}
                    ${hover ? 'hover:tw-bg-surface/60' : ''}
                    ${isRowEvents ? 'tw-cursor-pointer' : ''}
                    tw-transition-colors tw-duration-fast
                  `}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.dataField || colIdx}
                      className={`tw-px-4 ${condensed ? 'tw-py-2' : 'tw-py-4'} tw-text-ink`}
                    >
                      {col.formatter ? col.formatter(row[col.dataField], row) : row[col.dataField]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="tw-px-4 tw-py-8 tw-text-center tw-text-muted"
                >
                  {indication()}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
