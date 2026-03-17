import { useState, useEffect } from 'react';
import { getViolations, updateReportStatus } from '../api/reportApi';
import { ShieldAlert, CheckCircle2, MapPin, Clock, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Violations = () => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      const data = await getViolations();
      setViolations(data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch active violations.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      setUpdatingId(id);
      await updateReportStatus(id, 'resolved');
      setViolations((prev) => prev.filter((v) => v.reportId !== id && v._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-surface-50">
        <div className="animate-pulse flex flex-col items-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mb-4 opacity-50" />
          <p className="text-lg font-medium text-surface-500">Retrieving active violations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-surface-900 flex items-center justify-center md:justify-start gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            Active Violations
          </h1>
          <p className="text-surface-500 mt-2 text-lg">
            Review AI-flagged cleanliness hazards and dispatch resolution teams.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-xl border border-red-200 font-bold shadow-sm">
          <span>{violations.length} Critical Issues</span>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center gap-4">
          <ShieldAlert className="w-6 h-6" /> <span className="font-semibold">{error}</span>
        </div>
      ) : violations.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-surface-200 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-teal-500" />
          </div>
          <h3 className="text-2xl font-bold text-surface-900 mb-2">City is clean!</h3>
          <p className="text-surface-500 text-lg">No active violations detected by AI at this moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {violations.map((violation) => {
            const rid = violation.reportId || violation._id;
            return (
              <div key={rid} className="card group flex flex-col h-full hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
                {/* Image Section */}
                <div className="relative aspect-[4/3] w-full bg-surface-100 overflow-hidden">
                  <img
                    src={violation.imageUrl}
                    alt="Violation"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  {/* Floating Status Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5 border border-white/20">
                      <ShieldAlert className="w-3.5 h-3.5" /> Violation
                    </span>
                  </div>
                  {/* Confidence overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                     <p className="text-white font-medium flex gap-2 items-center text-sm shadow-black drop-shadow-md">
                        <Tag className="w-4 h-4 text-primary-400" /> 
                         AI Tags: {violation.labels?.slice(0, 3).join(', ') || 'Unknown'}
                     </p>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-surface-900 mb-4 leading-tight flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                    {violation.location?.name || 'Unknown Location'}
                  </h3>

                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center text-sm text-surface-500 gap-2">
                      <Clock className="w-4 h-4" />
                      {violation.createdAt ? formatDistanceToNow(new Date(violation.createdAt), { addSuffix: true }) : 'Unknown time'}
                    </div>
                    {violation.inspectorName && (
                      <div className="text-sm">
                        <span className="font-semibold text-surface-700">Inspector:</span> <span className="text-surface-600">{violation.inspectorName}</span>
                      </div>
                    )}
                    {violation.description && (
                      <p className="text-sm text-surface-600 bg-surface-50 p-3 rounded-xl border border-surface-100 italic line-clamp-3">
                        "{violation.description}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleResolve(rid)}
                    disabled={updatingId === rid}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:bg-surface-300 disabled:text-surface-500"
                  >
                    {updatingId === rid ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" /> Mark as Resolved
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Violations;
