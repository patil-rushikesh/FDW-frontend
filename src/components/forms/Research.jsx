import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const SectionCard = ({ title, icon, borderColor, children }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${borderColor} hover:shadow-lg transition-all duration-300`}>
    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      {title}
    </h3>
    {children}
  </div>
);

const ScoreCard = ({ label, score, verifiedScore, total }) => (
  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <span className="font-medium text-gray-700">{label}:</span>
      <span className="text-lg font-bold text-blue-600">
        {score} / {total}
      </span>
    </div>
    {verifiedScore !== undefined && (
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Verified Score:</span>
        <span className="font-medium text-green-600">{verifiedScore}</span>
      </div>
    )}
  </div>
);

const InputField = ({ label, name, type = "number", value, onChange, placeholder, proof, onProofChange }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="flex gap-4">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min="0"
        onKeyDown={(e) => {
          if (e.key === '-') {
            e.preventDefault();
          }
        }}
        onWheel={(e) => e.target.blur()}
        className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <input
        type="url"
        value={proof}
        onChange={(e) => onProofChange(name, e.target.value)}
        placeholder="Drive link for proof"
        className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />
    </div>
  </div>
);

const Research = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const userData = JSON.parse(localStorage.getItem("userData"));

  const [formData, setFormData] = useState({
    // Papers and Publications
    sciPapers: 0,
    esciPapers: 0,
    scopusPapers: 0,
    ugcPapers: 0,
    otherPapers: 0,

    // Conference Papers
    scopusConference: 0,
    otherConference: 0,

    // Book Chapters
    scopusChapter: 0,
    otherChapter: 0,

    // Books
    scopusBooks: 0,
    nationalBooks: 0,
    localBooks: 0,

    // Citations
    wosCitations: 0,
    scopusCitations: 0,
    googleCitations: 0,

    // Patents
    patentCommercialized: 0,
    patentGranted: 0,
    patentCollege: 0,
    patentCollegeGranted: 0,

    // Training and Revenue
    trainingRevenue: 0,
    nonResearchGrant: 0,

    // Products
    productCommercialized: 0,
    productDeveloped: 0,
    pocDeveloped: 0,

    // Awards
    internationalAward: 0,
    governmentAward: 0,
    nationalAward: 0,
    internationalFellowship: 0,
    nationalFellowship: 0
  });

  const [proofLinks, setProofLinks] = useState({});
  const [verifiedScores, setVerifiedScores] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProofChange = (field, link) => {
    setProofLinks(prev => ({
      ...prev,
      [field]: link
    }));
  };

  const calculatePapersScore = () => {
    const sciScore = Number(formData.sciPapers) * 100;
    const esciScore = Number(formData.esciPapers) * 50;
    const scopusScore = Number(formData.scopusPapers) * 50;
    const ugcScore = Number(formData.ugcPapers) * 10;
    const otherScore = Number(formData.otherPapers) * 5;
    return sciScore + esciScore + scopusScore + ugcScore + otherScore;
  };

  const calculateConferenceScore = () => {
    const scopusScore = Number(formData.scopusConference) * 30;
    const otherScore = Number(formData.otherConference) * 5;
    return Math.min(180, scopusScore + otherScore);
  };

  const calculateBookChapterScore = () => {
    const scopusScore = Number(formData.scopusChapter) * 30;
    const otherScore = Number(formData.otherChapter) * 5;
    return Math.min(150, scopusScore + otherScore);
  };

  const calculateBookScore = () => {
    const scopusScore = Number(formData.scopusBooks) * 100;
    const nationalScore = Number(formData.nationalBooks) * 30;
    const localScore = Number(formData.localBooks) * 10;
    return Math.min(200, scopusScore + nationalScore + localScore);
  };

  const calculateCitationScore = () => {
    const wosScore = Math.floor(Number(formData.wosCitations) / 3) * 3;
    const scopusScore = Math.floor(Number(formData.scopusCitations) / 3) * 3;
    const googleScore = Math.floor(Number(formData.googleCitations) / 3);
    return Math.min(50, wosScore + scopusScore + googleScore);
  };

  const calculatePatentScore = () => {
    const individualCommScore = Number(formData.patentCommercialized) * 20;
    const individualGrantScore = Number(formData.patentGranted) * 15;
    const collegeCommScore = Number(formData.patentCollege) * 100;
    const collegeGrantScore = Number(formData.patentCollegeGranted) * 30;
    return Math.min(220, individualCommScore + individualGrantScore + collegeCommScore + collegeGrantScore);
  };

  const calculateTrainingScore = () => {
    return Math.min(40, Number(formData.trainingRevenue) * 5);
  };

  const calculateNonResearchScore = () => {
    return Math.min(40, Number(formData.nonResearchGrant) * 5);
  };

  const calculateProductScore = () => {
    const commercializedScore = Number(formData.productCommercialized) * 100;
    const developedScore = Number(formData.productDeveloped) * 40;
    const pocScore = Number(formData.pocDeveloped) * 10;
    return Math.min(100, commercializedScore + developedScore + pocScore);
  };

  const calculateAwardScore = () => {
    const intAwardScore = Number(formData.internationalAward) * 30;
    const govtAwardScore = Number(formData.governmentAward) * 20;
    const natAwardScore = Number(formData.nationalAward) * 5;
    const intFellowScore = Number(formData.internationalFellowship) * 50;
    const natFellowScore = Number(formData.nationalFellowship) * 30;
    return Math.min(50, intAwardScore + govtAwardScore + natAwardScore + intFellowScore + natFellowScore);
  };

  const calculateTotalScore = () => {
    const total = calculatePapersScore() +
                 calculateConferenceScore() +
                 calculateBookChapterScore() +
                 calculateBookScore() +
                 calculateCitationScore() +
                 calculatePatentScore() +
                 calculateTrainingScore() +
                 calculateNonResearchScore() +
                 calculateProductScore() +
                 calculateAwardScore();

    // Apply cadre-specific limits
    switch (userData.role) {
      case "Professor":
        return Math.min(370, total);
      case "Associate Professor":
        return Math.min(300, total);
      case "Assistant Professor":
        return Math.min(210, total);
      default:
        return 0;
    }
  };

  const handleSubmit = async () => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const department = userData.dept;
    const user_id = userData._id;

    if (!department || !user_id) {
      alert("Department and User ID are required. Please login again.");
      return;
    }

    const payload = {
      papers: {
        sci: { count: Number(formData.sciPapers), proof: proofLinks.sciPapers },
        esci: { count: Number(formData.esciPapers), proof: proofLinks.esciPapers },
        scopus: { count: Number(formData.scopusPapers), proof: proofLinks.scopusPapers },
        ugc: { count: Number(formData.ugcPapers), proof: proofLinks.ugcPapers },
        other: { count: Number(formData.otherPapers), proof: proofLinks.otherPapers },
        marks: calculatePapersScore()
      },
      conferences: {
        scopus: { count: Number(formData.scopusConference), proof: proofLinks.scopusConference },
        other: { count: Number(formData.otherConference), proof: proofLinks.otherConference },
        marks: calculateConferenceScore()
      },
      // ... similar structures for other sections
      total_marks: calculateTotalScore()
    };

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/${department}/${user_id}/B`,
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
      {/* Papers Section */}
<SectionCard title="Research Papers" icon="📄" borderColor="border-blue-500">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <InputField
      label="SCI/SCIE Journal Papers (WoS)"
      name="sciPapers"
      value={formData.sciPapers}
      onChange={handleChange}
      proof={proofLinks.sciPapers}
      onProofChange={handleProofChange}
      placeholder="Number of papers"
    />
    <InputField
      label="ESCI Journal Papers (WoS)"
      name="esciPapers"
      value={formData.esciPapers}
      onChange={handleChange}
      proof={proofLinks.esciPapers}
      onProofChange={handleProofChange}
      placeholder="Number of papers"
    />
    <InputField
      label="Scopus Journal Papers"
      name="scopusPapers"
      value={formData.scopusPapers}
      onChange={handleChange}
      proof={proofLinks.scopusPapers}
      onProofChange={handleProofChange}
      placeholder="Number of papers"
    />
    <InputField
      label="UGC CARE Listed Papers"
      name="ugcPapers"
      value={formData.ugcPapers}
      onChange={handleChange}
      proof={proofLinks.ugcPapers}
      onProofChange={handleProofChange}
      placeholder="Number of papers"
    />
    <InputField
      label="Other Journal Papers"
      name="otherPapers"
      value={formData.otherPapers}
      onChange={handleChange}
      proof={proofLinks.otherPapers}
      onProofChange={handleProofChange}
      placeholder="Number of papers"
    />
  </div>
  <ScoreCard label="Papers Score" score={calculatePapersScore()} total="No limit" />
  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
    <div className="flex items-center justify-between">
      <span className="font-medium text-gray-700">Score After Verification:</span>
      <span className="text-lg font-bold text-green-600">{verifiedScores.papers || 'Pending'}</span>
    </div>
  </div>
</SectionCard>

{/* Conference Papers Section */}
<SectionCard title="Conference Papers" icon="🎯" borderColor="border-purple-500">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <InputField
      label="Scopus/WoS Indexed Conference Papers"
      name="scopusConference"
      value={formData.scopusConference}
      onChange={handleChange}
      proof={proofLinks.scopusConference}
      onProofChange={handleProofChange}
      placeholder="Number of papers"
    />
    <InputField
      label="Other Conference Papers"
      name="otherConference"
      value={formData.otherConference}
      onChange={handleChange}
      proof={proofLinks.otherConference}
      onProofChange={handleProofChange}
      placeholder="Number of papers"
    />
  </div>
  <ScoreCard label="Conference Papers Score" score={calculateConferenceScore()} total="180" />
  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
    <div className="flex items-center justify-between">
      <span className="font-medium text-gray-700">Score After Verification:</span>
      <span className="text-lg font-bold text-green-600">{verifiedScores.conference || 'Pending'}</span>
    </div>
  </div>
</SectionCard>

{/* Book Chapters Section */}
<SectionCard title="Book Chapters" icon="📚" borderColor="border-yellow-500">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <InputField
      label="Scopus/WoS Indexed Book Chapters"
      name="scopusChapter"
      value={formData.scopusChapter}
      onChange={handleChange}
      proof={proofLinks.scopusChapter}
      onProofChange={handleProofChange}
      placeholder="Number of chapters"
    />
    <InputField
      label="Other Book Chapters"
      name="otherChapter"
      value={formData.otherChapter}
      onChange={handleChange}
      proof={proofLinks.otherChapter}
      onProofChange={handleProofChange}
      placeholder="Number of chapters"
    />
  </div>
  <ScoreCard label="Book Chapters Score" score={calculateBookChapterScore()} total="150" />
  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
    <div className="flex items-center justify-between">
      <span className="font-medium text-gray-700">Score After Verification:</span>
      <span className="text-lg font-bold text-green-600">{verifiedScores.bookChapters || 'Pending'}</span>
    </div>
  </div>
</SectionCard>

{/* Books Section */}
<SectionCard title="Books Published" icon="📖" borderColor="border-red-500">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <InputField
      label="Scopus/WoS Indexed Books"
      name="scopusBooks"
      value={formData.scopusBooks}
      onChange={handleChange}
      proof={proofLinks.scopusBooks}
      onProofChange={handleProofChange}
      placeholder="Number of books"
    />
    <InputField
      label="International/National Publisher Books"
      name="nationalBooks"
      value={formData.nationalBooks}
      onChange={handleChange}
      proof={proofLinks.nationalBooks}
      onProofChange={handleProofChange}
      placeholder="Number of books"
    />
    <InputField
      label="Local Publisher Books"
      name="localBooks"
      value={formData.localBooks}
      onChange={handleChange}
      proof={proofLinks.localBooks}
      onProofChange={handleProofChange}
      placeholder="Number of books"
    />
  </div>
  <ScoreCard label="Books Score" score={calculateBookScore()} total="200" />
  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
    <div className="flex items-center justify-between">
      <span className="font-medium text-gray-700">Score After Verification:</span>
      <span className="text-lg font-bold text-green-600">{verifiedScores.books || 'Pending'}</span>
    </div>
  </div>
</SectionCard>

{/* Citations Section */}
<SectionCard title="Citations (Last 3 Years)" icon="📊" borderColor="border-indigo-500">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <InputField
      label="Web of Science Citations"
      name="wosCitations"
      value={formData.wosCitations}
      onChange={handleChange}
      proof={proofLinks.wosCitations}
      onProofChange={handleProofChange}
      placeholder="Number of citations"
    />
    <InputField
      label="Scopus Citations"
      name="scopusCitations"
      value={formData.scopusCitations}
      onChange={handleChange}
      proof={proofLinks.scopusCitations}
      onProofChange={handleProofChange}
      placeholder="Number of citations"
    />
    <InputField
      label="Google Scholar Citations"
      name="googleCitations"
      value={formData.googleCitations}
      onChange={handleChange}
      proof={proofLinks.googleCitations}
      onProofChange={handleProofChange}
      placeholder="Number of citations"
    />
  </div>
  <ScoreCard label="Citations Score" score={calculateCitationScore()} total="50" />
  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
    <div className="flex items-center justify-between">
      <span className="font-medium text-gray-700">Score After Verification:</span>
      <span className="text-lg font-bold text-green-600">{verifiedScores.citations || 'Pending'}</span>
    </div>
  </div>
</SectionCard>

{/* Patents Section */}
<SectionCard title="Patents" icon="📜" borderColor="border-orange-500">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <InputField
      label="Individual Patents Commercialized"
      name="patentCommercialized"
      value={formData.patentCommercialized}
      onChange={handleChange}
      proof={proofLinks.patentCommercialized}
      onProofChange={handleProofChange}
      placeholder="Number of patents"
    />
    <InputField
      label="Individual Patents Granted"
      name="patentGranted"
      value={formData.patentGranted}
      onChange={handleChange}
      proof={proofLinks.patentGranted}
      onProofChange={handleProofChange}
      placeholder="Number of patents"
    />
    <InputField
      label="College Patents Commercialized"
      name="patentCollege"
      value={formData.patentCollege}
      onChange={handleChange}
      proof={proofLinks.patentCollege}
      onProofChange={handleProofChange}
      placeholder="Number of patents"
    />
    <InputField
      label="College Patents Granted"
      name="patentCollegeGranted"
      value={formData.patentCollegeGranted}
      onChange={handleChange}
      proof={proofLinks.patentCollegeGranted}
      onProofChange={handleProofChange}
      placeholder="Number of patents"
    />
  </div>
  <ScoreCard label="Patents Score" score={calculatePatentScore()} total="220" />
  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
    <div className="flex items-center justify-between">
      <span className="font-medium text-gray-700">Score After Verification:</span>
      <span className="text-lg font-bold text-green-600">{verifiedScores.patents || 'Pending'}</span>
    </div>
  </div>
</SectionCard>

{/* Training and Revenue Section */}
<SectionCard title="Training and Revenue" icon="💰" borderColor="border-teal-500">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <InputField
      label="Training Revenue (in 10k INR)"
      name="trainingRevenue"
      value={formData.trainingRevenue}
      onChange={handleChange}
      proof={proofLinks.trainingRevenue}
      onProofChange={handleProofChange}
      placeholder="Amount in 10k INR"
    />
    <InputField
      label="Non-Research Grant (in 10k INR)"
      name="nonResearchGrant"
      value={formData.nonResearchGrant}
      onChange={handleChange}
      proof={proofLinks.nonResearchGrant}
      onProofChange={handleProofChange}
      placeholder="Amount in 10k INR"
    />
  </div>
  <ScoreCard label="Training Revenue Score" score={calculateTrainingScore()} total="40" />
  <ScoreCard label="Non-Research Grant Score" score={calculateNonResearchScore()} total="40" />
  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
    <div className="flex items-center justify-between">
      <span className="font-medium text-gray-700">Score After Verification:</span>
      <span className="text-lg font-bold text-green-600">{verifiedScores.training || 'Pending'}</span>
    </div>
  </div>
</SectionCard>

{/* Products Section */}
<SectionCard title="Products Developed" icon="🛠️" borderColor="border-pink-500">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <InputField
      label="Products Commercialized"
      name="productCommercialized"
      value={formData.productCommercialized}
      onChange={handleChange}
      proof={proofLinks.productCommercialized}
      onProofChange={handleProofChange}
      placeholder="Number of products"
    />
    <InputField
      label="Products Developed"
      name="productDeveloped"
      value={formData.productDeveloped}
      onChange={handleChange}
      proof={proofLinks.productDeveloped}
      onProofChange={handleProofChange}
      placeholder="Number of products"
    />
    <InputField
      label="POC Developed"
      name="pocDeveloped"
      value={formData.pocDeveloped}
      onChange={handleChange}
      proof={proofLinks.pocDeveloped}
      onProofChange={handleProofChange}
      placeholder="Number of POCs"
    />
  </div>
  <ScoreCard label="Products Score" score={calculateProductScore()} total="100" />
  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
    <div className="flex items-center justify-between">
      <span className="font-medium text-gray-700">Score After Verification:</span>
      <span className="text-lg font-bold text-green-600">{verifiedScores.products || 'Pending'}</span>
    </div>
  </div>
</SectionCard>

{/* Awards Section */}
<SectionCard title="Awards and Fellowships" icon="🏆" borderColor="border-amber-500">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <InputField
      label="International Awards"
      name="internationalAward"
      value={formData.internationalAward}
      onChange={handleChange}
      proof={proofLinks.internationalAward}
      onProofChange={handleProofChange}
      placeholder="Number of awards"
    />
    <InputField
      label="Government Awards"
      name="governmentAward"
      value={formData.governmentAward}
      onChange={handleChange}
      proof={proofLinks.governmentAward}
      onProofChange={handleProofChange}
      placeholder="Number of awards"
    />
    <InputField
      label="National Awards"
      name="nationalAward"
      value={formData.nationalAward}
      onChange={handleChange}
      proof={proofLinks.nationalAward}
      onProofChange={handleProofChange}
      placeholder="Number of awards"
    />
    <InputField
      label="International Fellowships"
      name="internationalFellowship"
      value={formData.internationalFellowship}
      onChange={handleChange}
      proof={proofLinks.internationalFellowship}
      onProofChange={handleProofChange}
      placeholder="Number of fellowships"
    />
    <InputField
      label="National Fellowships"
      name="nationalFellowship"
      value={formData.nationalFellowship}
      onChange={handleChange}
      proof={proofLinks.nationalFellowship}
      onProofChange={handleProofChange}
      placeholder="Number of fellowships"
    />
  </div>
  <ScoreCard label="Awards Score" score={calculateAwardScore()} total="50" />
  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
    <div className="flex items-center justify-between">
      <span className="font-medium text-gray-700">Score After Verification:</span>
      <span className="text-lg font-bold text-green-600">{verifiedScores.awards || 'Pending'}</span>
    </div>
  </div>
</SectionCard>


      {/* ... Similar sections for Conferences, Books, Citations, etc. */}

      {/* Total Score Section */}
      <div className="mt-8 bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Total Research Score</h2>
        </div>
        <div className="p-6">
          <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-gray-800">Total Score:</span>
              <span className="text-3xl font-bold text-blue-700">{calculateTotalScore()}</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Maximum score for {userData.role}: {
                userData.role === "Professor" ? "370" :
                userData.role === "Associate Professor" ? "300" :
                userData.role === "Assistant Professor" ? "210" : "N/A"
              }
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors duration-300"
        >
          Submit Research Details
        </button>
      </div>
    </div>
  );
};

export default Research;