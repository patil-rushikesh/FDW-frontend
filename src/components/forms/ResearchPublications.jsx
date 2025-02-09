import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useFormContext } from '../../context/FormContext';

export default function ResearchPublications() {
  const { formData, updateFormData } = useFormContext();
  const [publications, setPublications] = React.useState([{ id: 1 }]);

  const addPublication = () => {
    const newId = publications.length + 1;
    setPublications([...publications, { id: newId }]);
  };

  const removePublication = (id) => {
    setPublications(publications.filter(pub => pub.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h3 className="text-lg font-medium text-gray-900">Publications</h3>
          <button
            onClick={addPublication}
            className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700"
          >
            <Plus size={20} />
            <span>Add Publication</span>
          </button>
        </div>

        {publications.map((pub) => (
          <div key={pub.id} className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-md font-medium text-gray-700">Publication #{pub.id}</h4>
              <button
                onClick={() => removePublication(pub.id)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                className="input-field"
                name={`publication${pub.id}Title`}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Journal/Conference"
                  className="input-field"
                  name={`publication${pub.id}Venue`}
                />
                <input
                  type="text"
                  placeholder="Year"
                  className="input-field"
                  name={`publication${pub.id}Year`}
                />
              </div>
              <textarea
                placeholder="Abstract"
                rows={3}
                className="input-field"
                name={`publication${pub.id}Abstract`}
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900">Research Projects</h3>
        <textarea
          name="currentResearch"
          rows={4}
          placeholder="Describe your current research projects..."
          className="input-field mt-2"
        />
      </div>
    </div>
  );
}