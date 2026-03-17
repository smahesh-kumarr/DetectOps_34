const StatsCard = ({ title, value, icon, color }) => {
  
  // Extract base color to handle gradients/shadows gracefully
  // Example incoming color: "bg-blue-100 text-blue-700"
  const colorMatch = color.match(/bg-([a-z]+)-100/);
  const colorBase = colorMatch ? colorMatch[1] : 'primary';

  return (
    <div className={`card p-6 relative overflow-hidden group border-b-4 border-${colorBase}-500`}>
      <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${colorBase}-500/10 rounded-full blur-2xl group-hover:bg-${colorBase}-500/20 transition-all duration-500`}></div>
      
      <div className="flex items-center gap-5 relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner bg-${colorBase}-100/80 text-${colorBase}-600 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
          {icon}
        </div>
        
        <div>
          <p className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-3xl font-extrabold text-surface-900 tracking-tight">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
