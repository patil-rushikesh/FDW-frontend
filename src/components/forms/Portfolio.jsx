import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SectionCard = ({ title, icon, borderColor, children }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${borderColor} hover:shadow-lg transition-all duration-300`}>
    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      {title}
    </h3>
    {children}
  </div>
);

const ScoreCard = ({ label, score, total }) => (
  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-between shadow-sm">
    <span className="font-medium text-gray-700">{label}:</span>
    <span className="text-lg font-bold text-blue-600">
      {score} / {total}
    </span>
  </div>
);

const RadioGroup = ({ options, selectedValue, onChange }) => (
  <div className="space-y-2">
    {options.map((option) => (
      <label key={option.value} className="flex items-center space-x-3">
        <input
          type="radio"
          value={option.value}
          checked={selectedValue === option.value}
          onChange={(e) => onChange(e.target.value)}
          className="h-4 w-4 text-blue-600"
        />
        <span className="text-sm font-medium text-gray-700">{option.label}</span>
      </label>
    ))}
  </div>
);

const Portfolio = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData"));

  const [formData, setFormData] = useState({
    portfolioType: 'both', // 'both', 'institute', 'department'
    selfAwardedMarks: 30, // Default 50% of max 60
    deanMarks: 0,
    hodMarks: 0,
    isAdministrativeRole: false,
    administrativeRole: '', // 'deputy_director', 'dean', 'hod', 'associate_dean'
    adminSelfAwardedMarks: 30,
    directorMarks: 0,
    adminDeanMarks: 0
  });

  const handlePortfolioTypeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      portfolioType: value
    }));
  };

  const calculatePortfolioScore = () => {
    if (formData.isAdministrativeRole) {
      // For administrative roles
      const selfScore = Math.min(60, formData.adminSelfAwardedMarks);
      const superiorScore = formData.administrativeRole === 'associate_dean' 
        ? formData.adminDeanMarks 
        : formData.directorMarks;
      return Math.min(120, selfScore + superiorScore);
    } else {
      // For regular portfolio roles
      const selfScore = Math.min(60, formData.selfAwardedMarks);
      let superiorScore = 0;
      
      switch(formData.portfolioType) {
        case 'both':
          superiorScore = (formData.deanMarks + formData.hodMarks) / 2;
          break;
        case 'institute':
          superiorScore = formData.deanMarks;
          break;
        case 'department':
          superiorScore = formData.hodMarks;
          break;
        default:
          break;
      }
      
      return Math.min(120, selfScore + superiorScore);
    }
  };

  const handleSubmit = async () => {
    const department = userData.dept;
    const user_id = userData._id;

    if (!department || !user_id) {
      alert("Department and User ID are required. Please login again.");
      return;
    }

    const payload = {
      portfolioDetails: {
        type: formData.portfolioType,
        isAdministrative: formData.isAdministrativeRole,
        administrativeRole: formData.administrativeRole,
        selfAwardedMarks: formData.isAdministrativeRole ? formData.adminSelfAwardedMarks : formData.selfAwardedMarks,
        superiorMarks: formData.isAdministrativeRole ? 
          (formData.administrativeRole === 'associate_dean' ? formData.adminDeanMarks : formData.directorMarks) :
          (formData.portfolioType === 'both' ? (formData.deanMarks + formData.hodMarks) / 2 : 
           formData.portfolioType === 'institute' ? formData.deanMarks : formData.hodMarks)
      },
      total_marks: calculatePortfolioScore()
    };

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/${department}/${user_id}/D`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit data");
      }

      const result = await response.json();
      alert(result.message);
      navigate("/dashboard");
    } catch (error) {
      alert("Error submitting data: " + error.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Administrative Role Selection */}
      <SectionCard
        title="Role Selection"
        icon="👔"
        borderColor="border-purple-500"
      >
        <div className="mb-6">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.isAdministrativeRole}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                isAdministrativeRole: e.target.checked
              }))}
              className="h-4 w-4 text-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">I hold an administrative position</span>
          </label>
        </div>

        {formData.isAdministrativeRole && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Select your administrative role:</h4>
            <RadioGroup
              options={[
                { value: 'deputy_director', label: 'Deputy Director' },
                { value: 'dean', label: 'Dean' },
                { value: 'hod', label: 'HOD' },
                { value: 'associate_dean', label: 'Associate Dean' }
              ]}
              selectedValue={formData.administrativeRole}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                administrativeRole: value
              }))}
            />
          </div>
        )}
      </SectionCard>

      {/* Portfolio Type Selection - Only show if not administrative role */}
      {!formData.isAdministrativeRole && (
        <SectionCard
          title="Portfolio Selection"
          icon="📋"
          borderColor="border-blue-500"
        >
          <RadioGroup
            options={[
              { value: 'both', label: 'Both Institute and Department Level Portfolio' },
              { value: 'institute', label: 'Institute Level Portfolio Only' },
              { value: 'department', label: 'Department Level Portfolio Only' }
            ]}
            selectedValue={formData.portfolioType}
            onChange={handlePortfolioTypeChange}
          />
        </SectionCard>
      )}

      {/* Self Assessment */}
      <SectionCard
        title="Self Assessment"
        icon="✍️"
        borderColor="border-green-500"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.isAdministrativeRole ? 
                'Self Awarded Marks for Administrative Role' : 
                'Self Awarded Marks for Portfolio Work'}
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={formData.isAdministrativeRole ? formData.adminSelfAwardedMarks : formData.selfAwardedMarks}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                [formData.isAdministrativeRole ? 'adminSelfAwardedMarks' : 'selfAwardedMarks']: e.target.value
              }))}
              className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </SectionCard>

      {/* Superior Assessment */}
      <SectionCard
        title="Superior Assessment"
        icon="⭐"
        borderColor="border-yellow-500"
      >
        {formData.isAdministrativeRole ? (
          <div className="space-y-4">
            {formData.administrativeRole === 'associate_dean' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dean's Assessment</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={formData.adminDeanMarks}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    adminDeanMarks: e.target.value
                  }))}
                  className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Director's Assessment</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={formData.directorMarks}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    directorMarks: e.target.value
                  }))}
                  className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {(formData.portfolioType === 'both' || formData.portfolioType === 'institute') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dean's Assessment</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={formData.deanMarks}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    deanMarks: e.target.value
                  }))}
                  className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            
            {(formData.portfolioType === 'both' || formData.portfolioType === 'department') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">HOD's Assessment</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={formData.hodMarks}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    hodMarks: e.target.value
                  }))}
                  className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
        )}

        <ScoreCard
          label="Total Portfolio Score"
          score={calculatePortfolioScore()}
          total="120"
        />
      </SectionCard>

      {/* Submit Button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors duration-300"
        >
          Submit Portfolio Details
        </button>
      </div>
    </div>
  );
};

export default Portfolio;