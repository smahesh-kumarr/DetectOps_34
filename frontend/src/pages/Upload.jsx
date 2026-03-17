import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadReport } from '../api/uploadApi';
import { UploadCloud, MapPin, MapPinned, FileText, CheckCircle2, AlertCircle, Camera } from 'lucide-react';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError('');
    }
  };

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsGettingLocation(false);
        },
        (err) => {
          console.error(err);
          setError('Failed to get location. Please allow location access or skip coordinates.');
          setIsGettingLocation(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!file || !locationName) {
      setError('Please provide both an image and a location name.');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('locationName', locationName);
    if (description) formData.append('description', description);
    if (coordinates.lat && coordinates.lng) {
      formData.append('lat', coordinates.lat);
      formData.append('lng', coordinates.lng);
    }

    try {
      const data = await uploadReport(formData);
      setSuccess(`Success! AI Analysis: ${data.report?.status?.toUpperCase()}`);
      
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-primary-200">
          <Camera className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-surface-900 tracking-tight">
          Submit Inspection Report
        </h1>
        <p className="text-surface-500 mt-3 max-w-xl mx-auto text-lg hover:text-surface-700 transition-colors">
          Upload an image of a public facility and our AI will automatically detect cleanliness violations.
        </p>
      </div>

      <div className="card p-8 md:p-10 border-t-8 border-t-primary-500 shadow-2xl shadow-primary-900/5 relative overflow-hidden">
        
        {/* Decorative flair */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        
        {error && (
          <div className="mb-8 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl flex items-start gap-3 text-red-700 [animation:fade-in-up_0.3s_ease-out]">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-8 p-4 bg-primary-50/80 backdrop-blur-sm border border-primary-200 rounded-xl flex items-start gap-3 text-primary-800 [animation:fade-in-up_0.3s_ease-out]">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-primary-600" />
            <p className="font-bold text-lg">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          
          {/* Image Upload Area */}
          <div>
            <label className="label-text text-lg">Facility Photo <span className="text-red-500">*</span></label>
            <div className="mt-3 flex justify-center rounded-2xl border-2 border-dashed border-surface-300 px-6 py-12 hover:bg-surface-50 hover:border-primary-400 transition-all duration-300 relative overflow-hidden group bg-white">
              {previewUrl ? (
                <div className="relative w-full aspect-video md:aspect-[21/9] rounded-xl overflow-hidden shadow-inner">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-surface-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white font-bold flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full backdrop-blur-md">
                      <UploadCloud className="w-5 h-5" /> Replace Photo
                    </p>
                  </div>
                  <input type="file" onChange={handleFileChange} accept="image/jpeg, image/png, image/jpg" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 group-hover:scale-110 transition-all duration-300">
                    <UploadCloud className="h-10 w-10" aria-hidden="true" />
                  </div>
                  <div className="flex text-lg leading-6 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-bold text-primary-600 focus-within:outline-none hover:text-primary-500 transition-colors">
                      <span>Click to upload</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/jpeg, image/png, image/jpg" />
                    </label>
                    <p className="pl-2 text-surface-500">or drag and drop</p>
                  </div>
                  <p className="text-sm text-surface-400 mt-2 font-medium">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6 md:col-span-2">
              <div>
                <label className="label-text flex items-center gap-2" htmlFor="locationName">
                  <MapPin className="w-4 h-4 text-primary-500" /> Location Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="locationName"
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="input-field text-lg"
                  placeholder="e.g., Central Park Entrance, Main Street Bus Stop"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="label-text flex items-center gap-2 mb-0">
                    <MapPinned className="w-4 h-4 text-primary-500" /> GPS Coordinates (Optional)
                  </label>
                  <button 
                    type="button" 
                    onClick={handleGetLocation}
                    disabled={isGettingLocation}
                    className="text-sm bg-primary-50 text-primary-700 px-4 py-1.5 rounded-lg font-bold hover:bg-primary-100 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isGettingLocation ? 'Detecting satellite...' : 'Auto-Detect Location'}
                  </button>
                </div>
                <div className="flex gap-4">
                  <input
                    type="number" step="any"
                    value={coordinates.lat}
                    onChange={(e) => setCoordinates({...coordinates, lat: e.target.value})}
                    className="input-field bg-surface-50 text-surface-600 font-mono"
                    placeholder="Latitude"
                  />
                  <input
                    type="number" step="any"
                    value={coordinates.lng}
                    onChange={(e) => setCoordinates({...coordinates, lng: e.target.value})}
                    className="input-field bg-surface-50 text-surface-600 font-mono"
                    placeholder="Longitude"
                  />
                </div>
              </div>

              <div>
                <label className="label-text flex items-center gap-2" htmlFor="description">
                  <FileText className="w-4 h-4 text-primary-500" /> Additional Details (Optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field min-h-[120px] resize-y text-base"
                  placeholder="Describe the severity, context, or surrounding landmarks..."
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-surface-100 flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !file}
              className="btn-primary w-full md:w-auto px-10 py-4 text-lg gap-3 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Analyzing via AWS Rekognition...
                </>
              ) : (
                <>Submit Report securely <UploadCloud className="w-5 h-5" /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;
