import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getReports, getViolations, deleteViolation } from '../api/reportApi';
import StatsCard from '../components/StatsCard';
import { FileText, AlertTriangle, CheckCircle, Activity, Loader, ShieldAlert, CheckCircle2, MapPin, Clock, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.role === 'officer') {
          // Officers see all violations
          const data = await getViolations();
          setReports(data || []);
        } else {
          // Inspectors/Admins see stats + their relevant reports
          const data = await getReports();
          setReports(data || []);
        }
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleResolve = async (id) => {
    try {
      setUpdatingId(id);
      // Permanently DELETE the violation from DynamoDB — it won't reappear on refresh
      await deleteViolation(id);
      // Immediately remove from local state for all roles
      setReports((prev) => prev.filter((v) => v.reportId !== id && v._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve violation. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = useMemo(() => {
    const total = reports.length;
    const violationsCount = reports.filter(r => r.status === 'violation').length;
    const cleanOrResolved = reports.filter(r => r.status === 'clean' || r.status === 'resolved').length;
    return { total, violationsCount, cleanOrResolved };
  }, [reports]);

  const problemAreas = reports.filter(r => r.status === 'violation');

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center text-surface-500 bg-surface-50/50">
        <div className="relative">
          <div className="absolute inset-0 bg-primary-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <Loader className="w-12 h-12 animate-spin text-primary-600 relative z-10 mb-6" />
        </div>
        <p className="text-lg font-medium tracking-wide">Syncing real-time AWS analytics...</p>
      </div>
    );
  }

  const isOfficer = user?.role === 'officer';
  const canResolve = user?.role === 'officer'; // Only Officers can resolve violations

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-surface-900 tracking-tight">
            {isOfficer ? 'Active Violations Board' : user?.role === 'admin' ? 'Command Center' : 'Inspector Dashboard'}
          </h1>
          <p className="text-surface-500 mt-2 text-lg">
            {isOfficer ? 'Review and resolve city-wide cleanliness hazards.' : 'A unified view of civic cleanliness intelligence and problem areas.'}
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-surface-200 px-4 py-2 rounded-xl text-sm font-semibold text-surface-600 shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live DynamoDB Sync
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <AlertTriangle className="w-6 h-6" /> <span className="font-medium text-lg">{error}</span>
        </div>
      )}

      {/* Stats shown only for Inspector and Admin */}
      {!isOfficer && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="Total Audits" value={stats.total} icon={<FileText className="w-7 h-7" />} color="bg-blue-100 text-blue-700" />
          <StatsCard title="Severe Violations" value={stats.violationsCount} icon={<AlertTriangle className="w-7 h-7" />} color="bg-red-100 text-red-700" />
          <StatsCard title="Clean Zones" value={stats.cleanOrResolved} icon={<CheckCircle className="w-7 h-7" />} color="bg-teal-100 text-teal-700" />
          <StatsCard title="City Health Score" value={`${stats.total ? Math.round((stats.cleanOrResolved / stats.total) * 100) : 100}%`} icon={<Activity className="w-7 h-7" />} color="bg-indigo-100 text-indigo-700" />
        </div>
      )}

      {/* Problem Areas Section */}
      {!error && (
        <div className="mt-12 bg-surface-50 p-8 rounded-3xl border border-surface-200 shadow-sm">
          <h3 className="text-2xl font-bold text-surface-900 mb-8 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-500" /> Action Required: Problem Areas
          </h3>

          {problemAreas.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-surface-200 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-teal-500" />
              </div>
              <h3 className="text-2xl font-bold text-surface-900 mb-2">City is completely clean!</h3>
              <p className="text-surface-500 text-lg">No active violations or problem areas currently detected.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {problemAreas.map((violation) => {
                const rid = violation.reportId || violation._id;
                return (
                  <div key={rid} className="card group flex flex-col h-full hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 bg-white">
                    {/* Image Section */}
                    <div className="relative aspect-[4/3] w-full bg-surface-100 overflow-hidden rounded-t-2xl">
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
                            AI Tags: {Array.isArray(violation.labels) ? violation.labels.map(l => l.Name || l.name || '').filter(Boolean).slice(0, 3).join(', ') : 'Unknown'}
                        </p>
                      </div>
                    </div>

                    {/* Details Section */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-surface-900 mb-4 leading-tight flex items-start gap-2">
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
                      {canResolve && (
                        <button
                          onClick={() => handleResolve(rid)}
                          disabled={updatingId === rid}
                          className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:bg-surface-300 disabled:text-surface-500"
                        >
                          {updatingId === rid ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <CheckCircle2 className="w-5 h-5" /> Resolve Problem Area
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
