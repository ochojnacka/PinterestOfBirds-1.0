import { useState } from 'react';

const UploadForm = ({ API_URL, getAuthHeaders, onBirdAdded }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!name || !description || !imageFile) {
      setError('Please fill in all fields and select an image');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Upload image to S3
      const formData = new FormData();
      formData.append('image', imageFile);

      const uploadHeaders = getAuthHeaders();
      // Remove Content-Type for FormData (browser will set it with boundary)
      delete uploadHeaders['Content-Type'];

      const uploadRes = await fetch(`${API_URL}/uploads`, {
        method: 'POST',
        headers: uploadHeaders,
        body: formData,
      });

      if (!uploadRes.ok) {
        const uploadError = await uploadRes.json();
        throw new Error(uploadError.error || 'Failed to upload image');
      }

      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.imageUrl;

      // Step 2: Create bird with image URL
      const birdRes = await fetch(`${API_URL}/birds`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name,
          description,
          imageUrl,
        }),
      });

      if (!birdRes.ok) {
        const birdError = await birdRes.json();
        throw new Error(birdError.error || 'Failed to create bird');
      }

      // Success!
      setSuccess(true);
      setName('');
      setDescription('');
      setImageFile(null);
      setImagePreview(null);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

      // Call callback to refresh bird list
      setTimeout(() => {
        onBirdAdded();
      }, 1000);
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-cream rounded-xl shadow-2xl p-8 border-2 border-darkGreen/30">
        <h2 className="text-3xl font-serif font-bold text-vDarkGreen mb-6 text-center">
          Upload a New Bird
        </h2>

        {success && (
          <div className="mb-4 p-4 bg-green/20 text-darkGreen rounded-lg text-center">
            Bird uploaded successfully! Redirecting...
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-vDarkGreen mb-2 font-serif">
              Bird Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-darkGreen/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-darkGreen font-serif"
              placeholder="Enter bird name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-vDarkGreen mb-2 font-serif">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-darkGreen/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-darkGreen font-serif min-h-[100px]"
              placeholder="Enter bird description"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-vDarkGreen mb-2 font-serif">
              Bird Image *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-darkGreen/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-darkGreen"
              required
            />
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full h-48 object-cover rounded-lg border border-darkGreen/30"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-darkGreen text-cream px-6 py-3 rounded-lg font-serif font-bold text-lg hover:bg-vDarkGreen transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Uploading...' : success ? 'Uploaded!' : 'Upload Bird'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadForm;
