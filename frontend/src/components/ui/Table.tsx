import React from 'react';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}

export const Table = ({ children, className = '', ...props }: TableProps) => (
  <div className="overflow-x-auto w-full">
    <table className={`w-full text-left border-collapse ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export interface TheadProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const Thead = ({ children, className = '', ...props }: TheadProps) => (
  <thead className={`bg-slate-100/50 text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200/80 sticky top-0 backdrop-blur-xs z-10 ${className}`} {...props}>
    {children}
  </thead>
);

export interface TbodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const Tbody = ({ children, className = '', ...props }: TbodyProps) => (
  <tbody className={`divide-y divide-slate-100/80 text-xs font-semibold text-slate-700 bg-white/30 ${className}`} {...props}>
    {children}
  </tbody>
);

export interface TrProps extends React.HTMLAttributes<HTMLTableRowElement> {
  onClick?: () => void;
}

export const Tr = ({ children, className = '', onClick, ...props }: TrProps) => (
  <tr 
    onClick={onClick}
    className={`hover:bg-slate-50/50 transition-colors ${onClick ? 'cursor-pointer select-none' : ''} ${className}`}
    {...props}
  >
    {children}
  </tr>
);

export interface ThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

export const Th = ({ children, className = '', ...props }: ThProps) => (
  <th className={`px-6 py-3.5 whitespace-nowrap font-black border-b border-slate-200/80 ${className}`} {...props}>
    {children}
  </th>
);

export interface TdProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export const Td = ({ children, className = '', ...props }: TdProps) => (
  <td className={`px-6 py-4 whitespace-nowrap font-semibold ${className}`} {...props}>
    {children}
  </td>
);
