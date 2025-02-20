import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ClipLoader } from "react-spinners";




const SectionCard = ({ title, icon, borderColor, children }) => (
  <div
    className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${borderColor} hover:shadow-lg transition-all duration-300 mb-8`}
  >
    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      {title}
    </h3>
    {children}
  </div>
);

// Update ScoreCard component
const ScoreCard = ({
  label,
  score,
  total,
  verifiedScore,
  onVerifiedScoreChange,
  sectionVerifiedScores = {} // Add this prop
}) => (
  <div className="space-y-2">
    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-between shadow-sm">
      <span className="font-medium text-gray-700">{label}:</span>
      <span className="text-lg font-bold text-blue-600">
        {score} / {total}
      </span>
    </div>
    <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-700">
          Score After Verification:
        </span>
        <span className="text-lg font-bold text-green-600">
          {/* Calculate section total */}
          {Object.values(sectionVerifiedScores).reduce((sum, score) => sum + (score?.marks || 0), 0)}
        </span>
      </div>
    </div>
  </div>
);

// Modified InputFieldWithProof component
const InputFieldWithProof = ({ label, name, value, proofValue, onVerifiedScoreChange, verifiedScore }) => (
  <div className="space-y-2 mb-4">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="flex gap-2 items-center">
      <input
        type="number"
        name={name}
        value={value || 0}
        disabled={true}
        className="block w-1/4 px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 cursor-not-allowed"
      />
      {proofValue ? (
        <a
          href={proofValue}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
        >
          View Document
        </a>
      ) : (
        <span className="px-4 py-2 bg-gray-200 text-gray-600 font-medium rounded-md">
          View
        </span>
      )}
      <input
        type="number"
        value={verifiedScore || ""}
        onChange={(e) => onVerifiedScoreChange(parseInt(e.target.value) || 0)}
        min="0"
        placeholder="Verified Score"
        className="w-1/4 px-3 py-2 text-gray-700 bg-white border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  </div>
);

const VerificationForm = () => {
  const navigate = useNavigate();
  const { department, facultyId } = useParams();
  const { isAuthenticated } = useAuth();
  const userData = JSON.parse(localStorage.getItem("userData"));

  const initialVerifiedScores = {
    journalPapers: { marks: 0 },
    conferencePapers: { marks: 0 },
    bookChapters: { marks: 0 },
    books: { marks: 0 },
    citations: { marks: 0 },
    copyrightIndividual: { marks: 0 },
    copyrightInstitute: { marks: 0 },
    patentIndividual: { marks: 0 },
    patentInstitute: { marks: 0 },
    researchGrants: { marks: 0 },
    trainingPrograms: { marks: 0 },
    nonResearchGrants: { marks: 0 },
    productDevelopment: { marks: 0 },
    startup: { marks: 0 },
    awardsAndFellowships: { marks: 0 },
    industryInteraction: { marks: 0 },
    internshipPlacement: { marks: 0 }
  };

  const initialState = {
    // 1. Papers Published in Quality Journal
    sciJournalPapers: { count: 0, proof: "" },
    esciJournalPapers: { count: 0, proof: "" },
    scopusJournalPapers: { count: 0, proof: "" },
    ugcCareJournalPapers: { count: 0, proof: "" },
    otherJournalPapers: { count: 0, proof: "" },

    // 2. Papers Published in International Conference
    scopusWosConferencePapers: { count: 0, proof: "" },
    otherConferencePapers: { count: 0, proof: "" },

    // 3. Book Chapter Publication
    scopusWosBooksChapters: { count: 0, proof: "" },
    otherBooksChapters: { count: 0, proof: "" },

    // 4. Book Publication
    scopusWosBooks: { count: 0, proof: "" },
    nonIndexedIntlNationalBooks: { count: 0, proof: "" },
    localPublisherBooks: { count: 0, proof: "" },

    // 5. Last three Years Citations
    webOfScienceCitations: { count: 0, proof: "" },
    scopusCitations: { count: 0, proof: "" },
    googleScholarCitations: { count: 0, proof: "" },

    // 6. Copyright in Individual Name
    indianCopyrightRegistered: { count: 0, proof: "" },
    indianCopyrightGranted: { count: 0, proof: "" },

    // 7. Copyright in Institute Name
    indianCopyrightRegisteredInstitute: { count: 0, proof: "" },
    indianCopyrightGrantedInstitute: { count: 0, proof: "" },

    // 8. Patent in Individual name
    indianPatentRegistered: { count: 0, proof: "" },
    indianPatentPublished: { count: 0, proof: "" },
    indianPatentGranted: { count: 0, proof: "" },
    indianPatentCommercialized: { count: 0, proof: "" },

    // 9. Patent in Institute name
    indianPatentRegisteredInstitute: { count: 0, proof: "" },
    indianPatentPublishedInstitute: { count: 0, proof: "" },
    indianPatentGrantedInstitute: { count: 0, proof: "" },
    indianPatentCommercializedInstitute: { count: 0, proof: "" },

    // 10. Grants received for research projects
    researchGrants: { amount: 0, proof: "" },

    // 11. Revenue Generated through Training Programs
    trainingProgramsRevenue: { amount: 0, proof: "" },

    // 12. Non-research/ Non consultancy Grant
    nonResearchGrants: { amount: 0, proof: "" },

    // 13. Product Developed with PCCoE-CIIL Stake
    commercializedProducts: { count: 0, proof: "" },
    developedProducts: { count: 0, proof: "" },
    proofOfConcepts: { count: 0, proof: "" },

    // 14. Start Up with PCCoE-CIIL Stake
    startupRevenueFiftyK: { count: 0, proof: "" },
    startupFundsFiveLakhs: { count: 0, proof: "" },
    startupProducts: { count: 0, proof: "" },
    startupPOCs: { count: 0, proof: "" },
    startupRegistered: { count: 0, proof: "" },

    // 15. Award/ Fellowship Received
    internationalAwards: { count: 0, proof: "" },
    governmentAwards: { count: 0, proof: "" },
    nationalAwards: { count: 0, proof: "" },
    internationalFellowships: { count: 0, proof: "" },
    nationalFellowships: { count: 0, proof: "" },

    // 16. Outcome through National/ International Industry/ University Interaction
    activeMoUs: { count: 0, proof: "" },
    industryCollaboration: { count: 0, proof: "" },

    // 17. Industry association for internship/placement
    internshipPlacementOffers: { count: 0, proof: "" },
  };

  

  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifiedScores, setVerifiedScores] = useState(initialVerifiedScores);

  useEffect(() => {
    const transformApiResponse = (data) => {
      const newFormData = { ...initialState };
      const newVerifiedScores = {
        journalPapers: { marks: 0 },
        conferencePapers: { marks: 0 },
        bookChapters: { marks: 0 },
        books: { marks: 0 },
        citations: { marks: 0 },
        copyrightIndividual: { marks: 0 },
        copyrightInstitute: { marks: 0 },
        patentIndividual: { marks: 0 },
        patentInstitute: { marks: 0 },
        researchGrants: { marks: 0 },
        trainingPrograms: { marks: 0 },
        nonResearchGrants: { marks: 0 },
        productDevelopment: { marks: 0 },
        startup: { marks: 0 },
        awardsAndFellowships: { marks: 0 },
        industryInteraction: { marks: 0 },
        internshipPlacement: { marks: 0 }
      };
    
      if (data[1]) {
        // Journal Papers
        newFormData.sciJournalPapers = {
          count: data[1].journalPapers?.sciCount || 0,
          proof: data[1].journalPapers?.sciProof || "",
        };
        newFormData.esciJournalPapers = {
          count: data[1].journalPapers?.esciCount || 0,
          proof: data[1].journalPapers?.esciProof || "",
        };
        newFormData.scopusJournalPapers = {
          count: data[1].journalPapers?.scopusCount || 0,
          proof: data[1].journalPapers?.scopusProof || "",
        };
        newFormData.ugcCareJournalPapers = {
          count: data[1].journalPapers?.ugcCareCount || 0,
          proof: data[1].journalPapers?.ugcCareProof || "",
        };
        newFormData.otherJournalPapers = {
          count: data[1].journalPapers?.otherCount || 0,
          proof: data[1].journalPapers?.otherProof || "",
        };
        newVerifiedScores.journalPapers.marks = data[1].journalPapers?.verified_marks || 0;
      }
    
      if (data[2]) {
        // Conference Papers
        newFormData.scopusWosConferencePapers = {
          count: data[2].conferencePapers?.scopusWosCount || 0,
          proof: data[2].conferencePapers?.scopusWosProof || "",
        };
        newFormData.otherConferencePapers = {
          count: data[2].conferencePapers?.otherCount || 0,
          proof: data[2].conferencePapers?.otherProof || "",
        };
        newVerifiedScores.conferencePapers.marks = data[2].conferencePapers?.verified_marks || 0;
      }
    
      if (data[3]) {
        // Book Chapters
        newFormData.scopusWosBooksChapters = {
          count: data[3].bookChapters?.scopusWosCount || 0,
          proof: data[3].bookChapters?.scopusWosProof || "",
        };
        newFormData.otherBooksChapters = {
          count: data[3].bookChapters?.otherCount || 0,
          proof: data[3].bookChapters?.otherProof || "",
        };
        newVerifiedScores.bookChapters.marks = data[3].bookChapters?.verified_marks || 0;
      }
    
      if (data[4]) {
        // Books
        newFormData.scopusWosBooks = {
          count: data[4].books?.scopusWosCount || 0,
          proof: data[4].books?.scopusWosProof || "",
        };
        newFormData.nonIndexedIntlNationalBooks = {
          count: data[4].books?.nonIndexedCount || 0,
          proof: data[4].books?.nonIndexedProof || "",
        };
        newFormData.localPublisherBooks = {
          count: data[4].books?.localCount || 0,
          proof: data[4].books?.localProof || "",
        };
        newVerifiedScores.books.marks = data[4].books?.verified_marks || 0;
      }
    
      if (data[5]) {
        // Citations
        newFormData.webOfScienceCitations = {
          count: data[5].citations?.webOfScienceCount || 0,
          proof: data[5].citations?.webOfScienceProof || "",
        };
        newFormData.scopusCitations = {
          count: data[5].citations?.scopusCount || 0,
          proof: data[5].citations?.scopusProof || "",
        };
        newFormData.googleScholarCitations = {
          count: data[5].citations?.googleScholarCount || 0,
          proof: data[5].citations?.googleScholarProof || "",
        };
        newVerifiedScores.citations.marks = data[5].citations?.verified_marks || 0;
      }
    
      if (data[6]) {
        // Copyright Individual
        newFormData.indianCopyrightRegistered = {
          count: data[6].copyrightIndividual?.registeredCount || 0,
          proof: data[6].copyrightIndividual?.registeredProof || "",
        };
        newFormData.indianCopyrightGranted = {
          count: data[6].copyrightIndividual?.grantedCount || 0,
          proof: data[6].copyrightIndividual?.grantedProof || "",
        };
        newVerifiedScores.copyrightIndividual.marks = data[6].copyrightIndividual?.verified_marks || 0;
      }
    
      if (data[7]) {
        // Copyright Institute
        newFormData.indianCopyrightRegisteredInstitute = {
          count: data[7].copyrightInstitute?.registeredCount || 0,
          proof: data[7].copyrightInstitute?.registeredProof || "",
        };
        newFormData.indianCopyrightGrantedInstitute = {
          count: data[7].copyrightInstitute?.grantedCount || 0,
          proof: data[7].copyrightInstitute?.grantedProof || "",
        };
        newVerifiedScores.copyrightInstitute.marks = data[7].copyrightInstitute?.verified_marks || 0;
      }
    
      if (data[8]) {
        // Patent Individual
        newFormData.indianPatentRegistered = {
          count: data[8].patentIndividual?.registeredCount || 0,
          proof: data[8].patentIndividual?.registeredProof || "",
        };
        newFormData.indianPatentPublished = {
          count: data[8].patentIndividual?.publishedCount || 0,
          proof: data[8].patentIndividual?.publishedProof || "",
        };
        newFormData.indianPatentGranted = {
          count: data[8].patentIndividual?.grantedCount || 0,
          proof: data[8].patentIndividual?.grantedProof || "",
        };
        newFormData.indianPatentCommercialized = {
          count: data[8].patentIndividual?.commercializedCount || 0,
          proof: data[8].patentIndividual?.commercializedProof || "",
        };
        newVerifiedScores.patentIndividual.marks = data[8].patentIndividual?.verified_marks || 0;
      }
    
      if (data[9]) {
        // Patent Institute
        newFormData.indianPatentRegisteredInstitute = {
          count: data[9].patentInstitute?.registeredCount || 0,
          proof: data[9].patentInstitute?.registeredProof || "",
        };
        newFormData.indianPatentPublishedInstitute = {
          count: data[9].patentInstitute?.publishedCount || 0,
          proof: data[9].patentInstitute?.publishedProof || "",
        };
        newFormData.indianPatentGrantedInstitute = {
          count: data[9].patentInstitute?.grantedCount || 0,
          proof: data[9].patentInstitute?.grantedProof || "",
        };
        newFormData.indianPatentCommercializedInstitute = {
          count: data[9].patentInstitute?.commercializedCount || 0,
          proof: data[9].patentInstitute?.commercializedProof || "",
        };
        newVerifiedScores.patentInstitute.marks = data[9].patentInstitute?.verified_marks || 0;
      }
    
      if (data[10]) {
        // Research Grants
        newFormData.researchGrants = {
          amount: data[10].researchGrants?.amount || 0,
          proof: data[10].researchGrants?.proof || "",
        };
        newVerifiedScores.researchGrants.marks = data[10].researchGrants?.verified_marks || 0;
      }
    
      if (data[11]) {
        // Training Programs
        newFormData.trainingProgramsRevenue = {
          amount: data[11].trainingPrograms?.amount || 0,
          proof: data[11].trainingPrograms?.proof || "",
        };
        newVerifiedScores.trainingPrograms.marks = data[11].trainingPrograms?.verified_marks || 0;
      }
    
      if (data[12]) {
        // Non-Research Grants
        newFormData.nonResearchGrants = {
          amount: data[12].nonResearchGrants?.amount || 0,
          proof: data[12].nonResearchGrants?.proof || "",
        };
        newVerifiedScores.nonResearchGrants.marks = data[12].nonResearchGrants?.verified_marks || 0;
      }
    
      if (data[13]) {
        // Product Development
        newFormData.commercializedProducts = {
          count: data[13].productDevelopment?.commercializedCount || 0,
          proof: data[13].productDevelopment?.commercializedProof || "",
        };
        newFormData.developedProducts = {
          count: data[13].productDevelopment?.developedCount || 0,
          proof: data[13].productDevelopment?.developedProof || "",
        };
        newFormData.proofOfConcepts = {
          count: data[13].productDevelopment?.pocCount || 0,
          proof: data[13].productDevelopment?.pocProof || "",
        };
        newVerifiedScores.productDevelopment.marks = data[13].productDevelopment?.verified_marks || 0;
      }
    
      if (data[14]) {
        // Startup
        newFormData.startupRevenueFiftyK = {
          count: data[14].startup?.revenueFiftyKCount || 0,
          proof: data[14].startup?.revenueFiftyKProof || "",
        };
        newFormData.startupFundsFiveLakhs = {
          count: data[14].startup?.fundsFiveLakhsCount || 0,
          proof: data[14].startup?.fundsFiveLakhsProof || "",
        };
        newFormData.startupProducts = {
          count: data[14].startup?.productsCount || 0,
          proof: data[14].startup?.productsProof || "",
        };
        newFormData.startupPOCs = {
          count: data[14].startup?.pocCount || 0,
          proof: data[14].startup?.pocProof || "",
        };
        newFormData.startupRegistered = {
          count: data[14].startup?.registeredCount || 0,
          proof: data[14].startup?.registeredProof || "",
        };
        newVerifiedScores.startup.marks = data[14].startup?.verified_marks || 0;
      }
    
      if (data[15]) {
        // Awards and Fellowships
        newFormData.internationalAwards = {
          count: data[15].awardsAndFellowships?.internationalAwardsCount || 0,
          proof: data[15].awardsAndFellowships?.internationalAwardsProof || "",
        };
        newFormData.governmentAwards = {
          count: data[15].awardsAndFellowships?.governmentAwardsCount || 0,
          proof: data[15].awardsAndFellowships?.governmentAwardsProof || "",
        };
        newFormData.nationalAwards = {
          count: data[15].awardsAndFellowships?.nationalAwardsCount || 0,
          proof: data[15].awardsAndFellowships?.nationalAwardsProof || "",
        };
        newFormData.internationalFellowships = {
          count: data[15].awardsAndFellowships?.internationalFellowshipsCount || 0,
          proof: data[15].awardsAndFellowships?.internationalFellowshipsProof || "",
        };
        newFormData.nationalFellowships = {
          count: data[15].awardsAndFellowships?.nationalFellowshipsCount || 0,
          proof: data[15].awardsAndFellowships?.nationalFellowshipsProof || "",
        };
        newVerifiedScores.awardsAndFellowships.marks = data[15].awardsAndFellowships?.verified_marks || 0;
      }
    
      if (data[16]) {
        // Industry Interaction
        newFormData.activeMoUs = {
          count: data[16].industryInteraction?.moUsCount || 0,
          proof: data[16].industryInteraction?.moUsProof || "",
        };
        newFormData.industryCollaboration = {
          count: data[16].industryInteraction?.collaborationCount || 0,
          proof: data[16].industryInteraction?.collaborationProof || "",
        };
        newVerifiedScores.industryInteraction.marks = data[16].industryInteraction?.verified_marks || 0;
      }
    
      if (data[17]) {
        // Internship Placement
        newFormData.internshipPlacementOffers = {
          count: data[17].internshipPlacement?.offersCount || 0,
          proof: data[17].internshipPlacement?.offersProof || "",
        };
        newVerifiedScores.internshipPlacement.marks = data[17].internshipPlacement?.verified_marks || 0;
      }
    
      return {
        formData: newFormData,
        verifiedScores: newVerifiedScores
      };
    };
    
    // Update the fetchExistingData function to use the transformed verified scores
    const fetchExistingData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/${department}/${facultyId}/B`
        );
    
        if (response.ok) {
          const data = await response.json();
          if (data) {
            const transformedData = transformApiResponse(data);
            setFormData(transformedData.formData);
            setVerifiedScores(transformedData.verifiedScores);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load existing data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingData();
  }, []);

  const handleInputChange = (field, subfield, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [subfield]: value,
      },
    }));
  };

  // Calculate scores for each section
  const calculateScores = () => {
    // 1. Papers Published in Quality Journal (No Maximum)
    const journalPapersScore =
      formData.sciJournalPapers.count * 100 +
      formData.esciJournalPapers.count * 50 +
      formData.scopusJournalPapers.count * 50 +
      formData.ugcCareJournalPapers.count * 10 +
      formData.otherJournalPapers.count * 5;

    // 2. Papers Published in International Conference (Max 180)
    const conferencePapersScore = Math.min(
      180,
      formData.scopusWosConferencePapers.count * 30 +
        formData.otherConferencePapers.count * 5
    );

    // 3. Book Chapter Publication (Max 150)
    const bookChaptersScore = Math.min(
      150,
      formData.scopusWosBooksChapters.count * 30 +
        formData.otherBooksChapters.count * 5
    );

    // 4. Book Publication (Max 200)
    const booksScore = Math.min(
      200,
      formData.scopusWosBooks.count * 100 +
        formData.nonIndexedIntlNationalBooks.count * 30 +
        formData.localPublisherBooks.count * 10
    );

    // 5. Last three Years Citations (Max 50)
    const citationsScore = Math.min(
      50,
      Math.floor(formData.webOfScienceCitations.count / 3) * 3 +
        Math.floor(formData.scopusCitations.count / 3) * 3 +
        Math.floor(formData.googleScholarCitations.count / 3)
    );

    // 6. Copyright in Individual Name (Max 30)
    const copyrightIndividualScore = Math.min(
      30,
      formData.indianCopyrightRegistered.count * 5 +
        formData.indianCopyrightGranted.count * 15
    );

    // 7. Copyright in Institute Name (No Max)
    const copyrightInstituteScore =
      formData.indianCopyrightRegisteredInstitute.count * 10 +
      formData.indianCopyrightGrantedInstitute.count * 30;

    // 8. Patent in Individual name (Max 100)
    const patentIndividualScore = Math.min(
      100,
      formData.indianPatentRegistered.count * 15 +
        formData.indianPatentPublished.count * 30 +
        formData.indianPatentGranted.count * 50 +
        formData.indianPatentCommercialized.count * 100
    );

    // 9. Patent in Institute name (No Max)
    const patentInstituteScore =
      formData.indianPatentRegisteredInstitute.count * 30 +
      formData.indianPatentPublishedInstitute.count * 60 +
      formData.indianPatentGrantedInstitute.count * 100 +
      formData.indianPatentCommercializedInstitute.count * 200;

    // 10. Grants received for research projects (No Max)
    const researchGrantsScore =
      Math.floor(formData.researchGrants.amount / 200000) * 10;

    // 11. Revenue Generated through Training Programs (Max 40)
    const trainingRevenueScore = Math.min(
      40,
      Math.floor(formData.trainingProgramsRevenue.amount / 10000) * 5
    );

    // 12. Non-research/ Non consultancy Grant (Max 40)
    const nonResearchGrantsScore = Math.min(
      40,
      Math.floor(formData.nonResearchGrants.amount / 10000) * 5
    );

    // 13. Product Developed with PCCoE-CIIL Stake (Max 100)
    const productDevelopedScore = Math.min(
      100,
      formData.commercializedProducts.count * 100 +
        formData.developedProducts.count * 40 +
        formData.proofOfConcepts.count * 10
    );

    // 14. Start Up with PCCoE-CIIL Stake (No Max)
    const startupScore =
      formData.startupRevenueFiftyK.count * 100 +
      formData.startupFundsFiveLakhs.count * 100 +
      formData.startupProducts.count * 40 +
      formData.startupPOCs.count * 10 +
      formData.startupRegistered.count * 5;

    // 15. Award/ Fellowship Received (Max 50)
    const awardFellowshipScore = Math.min(
      50,
      formData.internationalAwards.count * 30 +
        formData.governmentAwards.count * 20 +
        formData.nationalAwards.count * 5 +
        formData.internationalFellowships.count * 50 +
        formData.nationalFellowships.count * 30
    );

    // 16. Outcome through National/ International Industry/ University Interaction (No Max)
    const interactionScore =
      formData.activeMoUs.count * 10 +
      formData.industryCollaboration.count * 20;

    // 17. Industry association for internship/placement (No Max)
    const internshipPlacementScore =
      formData.internshipPlacementOffers.count * 10;

    // Calculate total score before applying cadre limits
    const totalScoreBeforeCadreLimit =
      journalPapersScore +
      conferencePapersScore +
      bookChaptersScore +
      booksScore +
      citationsScore +
      copyrightIndividualScore +
      copyrightInstituteScore +
      patentIndividualScore +
      patentInstituteScore +
      researchGrantsScore +
      trainingRevenueScore +
      nonResearchGrantsScore +
      productDevelopedScore +
      startupScore +
      awardFellowshipScore +
      interactionScore +
      internshipPlacementScore;

    // Apply cadre-specific limits
    let totalScore;
    switch (userData.role) {
      case "Professor":
        totalScore = Math.min(370, totalScoreBeforeCadreLimit);
        break;
      case "Associate Professor":
        totalScore = Math.min(300, totalScoreBeforeCadreLimit);
        break;
      case "Assistant Professor":
        totalScore = Math.min(210, totalScoreBeforeCadreLimit);
        break;
      default:
        totalScore = 0;
    }

    return {
      journalPapersScore,
      conferencePapersScore,
      bookChaptersScore,
      booksScore,
      citationsScore,
      copyrightIndividualScore,
      copyrightInstituteScore,
      patentIndividualScore,
      patentInstituteScore,
      researchGrantsScore,
      trainingRevenueScore,
      nonResearchGrantsScore,
      productDevelopedScore,
      startupScore,
      awardFellowshipScore,
      interactionScore,
      internshipPlacementScore,
      totalScoreBeforeCadreLimit,
      totalScore,
    };
  };

  const scores = calculateScores();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const userData = JSON.parse(localStorage.getItem("userData"));
    const department = userData.dept;
    const user_id = userData._id;

    if (!department || !user_id) {
      alert("Department and User ID are required. Please login again.");
      return;
    }

    const scores = calculateScores();

    const payload = {
      1: {
        journalPapers: {
          sciCount: formData.sciJournalPapers.count,
          sciProof: formData.sciJournalPapers.proof,
          esciCount: formData.esciJournalPapers.count,
          esciProof: formData.esciJournalPapers.proof,
          scopusCount: formData.scopusJournalPapers.count,
          scopusProof: formData.scopusJournalPapers.proof,
          ugcCareCount: formData.ugcCareJournalPapers.count,
          ugcCareProof: formData.ugcCareJournalPapers.proof,
          otherCount: formData.otherJournalPapers.count,
          otherProof: formData.otherJournalPapers.proof,
          marks: scores.journalPapersScore,
          verified_marks: verifiedScores.journalPapers?.marks || 0
        },
      },
      2: {
        conferencePapers: {
          scopusWosCount: formData.scopusWosConferencePapers.count,
          scopusWosProof: formData.scopusWosConferencePapers.proof,
          otherCount: formData.otherConferencePapers.count,
          otherProof: formData.otherConferencePapers.proof,
          marks: scores.conferencePapersScore,
          verified_marks: verifiedScores.conferencePapers?.marks || 0
        },
      },
      3: {
        bookChapters: {
          scopusWosCount: formData.scopusWosBooksChapters.count,
          scopusWosProof: formData.scopusWosBooksChapters.proof,
          otherCount: formData.otherBooksChapters.count,
          otherProof: formData.otherBooksChapters.proof,
          marks: scores.bookChaptersScore,
          verified_marks: verifiedScores.bookChapters?.marks || 0
        },
      },
      4: {
        books: {
          scopusWosCount: formData.scopusWosBooks.count,
          scopusWosProof: formData.scopusWosBooks.proof,
          nonIndexedCount: formData.nonIndexedIntlNationalBooks.count,
          nonIndexedProof: formData.nonIndexedIntlNationalBooks.proof,
          localCount: formData.localPublisherBooks.count,
          localProof: formData.localPublisherBooks.proof,
          marks: scores.booksScore,
          verified_marks: verifiedScores.books?.marks || 0
        },
      },
      5: {
        citations: {
          webOfScienceCount: formData.webOfScienceCitations.count,
          webOfScienceProof: formData.webOfScienceCitations.proof,
          scopusCount: formData.scopusCitations.count,
          scopusProof: formData.scopusCitations.proof,
          googleScholarCount: formData.googleScholarCitations.count,
          googleScholarProof: formData.googleScholarCitations.proof,
          marks: scores.citationsScore,
          verified_marks: verifiedScores.citations?.marks || 0
        },
      },
      6: {
        copyrightIndividual: {
          registeredCount: formData.indianCopyrightRegistered.count,
          registeredProof: formData.indianCopyrightRegistered.proof,
          grantedCount: formData.indianCopyrightGranted.count,
          grantedProof: formData.indianCopyrightGranted.proof,
          marks: scores.copyrightIndividualScore,
          verified_marks: verifiedScores.copyrightIndividual?.marks || 0
        },
      },
      7: {
        copyrightInstitute: {
          registeredCount: formData.indianCopyrightRegisteredInstitute.count,
          registeredProof: formData.indianCopyrightRegisteredInstitute.proof,
          grantedCount: formData.indianCopyrightGrantedInstitute.count,
          grantedProof: formData.indianCopyrightGrantedInstitute.proof,
          marks: scores.copyrightInstituteScore,
          verified_marks: verifiedScores.copyrightInstitute?.marks || 0
        },
      },
      8: {
        patentIndividual: {
          registeredCount: formData.indianPatentRegistered.count,
          registeredProof: formData.indianPatentRegistered.proof,
          publishedCount: formData.indianPatentPublished.count,
          publishedProof: formData.indianPatentPublished.proof,
          grantedCount: formData.indianPatentGranted.count,
          grantedProof: formData.indianPatentGranted.proof,
          commercializedCount: formData.indianPatentCommercialized.count,
          commercializedProof: formData.indianPatentCommercialized.proof,
          marks: scores.patentIndividualScore,
          verified_marks: verifiedScores.patentIndividual?.marks || 0
        },
      },
      9: {
        patentInstitute: {
          registeredCount: formData.indianPatentRegisteredInstitute.count,
          registeredProof: formData.indianPatentRegisteredInstitute.proof,
          publishedCount: formData.indianPatentPublishedInstitute.count,
          publishedProof: formData.indianPatentPublishedInstitute.proof,
          grantedCount: formData.indianPatentGrantedInstitute.count,
          grantedProof: formData.indianPatentGrantedInstitute.proof,
          commercializedCount:
            formData.indianPatentCommercializedInstitute.count,
          commercializedProof:
            formData.indianPatentCommercializedInstitute.proof,
          marks: scores.patentInstituteScore,
          verified_marks: verifiedScores.patentInstitute?.marks || 0
        },
      },
      10: {
        researchGrants: {
          amount: formData.researchGrants.amount,
          proof: formData.researchGrants.proof,
          marks: scores.researchGrantsScore,
          verified_marks: verifiedScores.researchGrants?.marks || 0
        },
      },
      11: {
        trainingPrograms: {
          amount: formData.trainingProgramsRevenue.amount,
          proof: formData.trainingProgramsRevenue.proof,
          marks: scores.trainingRevenueScore,
          verified_marks: verifiedScores.trainingPrograms?.marks || 0
        },
      },
      12: {
        nonResearchGrants: {
          amount: formData.nonResearchGrants.amount,
          proof: formData.nonResearchGrants.proof,
          marks: scores.nonResearchGrantsScore,
          verified_marks: verifiedScores.nonResearchGrants?.marks || 0
        },
      },
      13: {
        productDevelopment: {
          commercializedCount: formData.commercializedProducts.count,
          commercializedProof: formData.commercializedProducts.proof,
          developedCount: formData.developedProducts.count,
          developedProof: formData.developedProducts.proof,
          pocCount: formData.proofOfConcepts.count,
          pocProof: formData.proofOfConcepts.proof,
          marks: scores.productDevelopedScore,
          verified_marks: verifiedScores.productDevelopment?.marks || 0
        },
      },
      14: {
        startup: {
          revenueFiftyKCount: formData.startupRevenueFiftyK.count,
          revenueFiftyKProof: formData.startupRevenueFiftyK.proof,
          fundsFiveLakhsCount: formData.startupFundsFiveLakhs.count,
          fundsFiveLakhsProof: formData.startupFundsFiveLakhs.proof,
          productsCount: formData.startupProducts.count,
          productsProof: formData.startupProducts.proof,
          pocCount: formData.startupPOCs.count,
          pocProof: formData.startupPOCs.proof,
          registeredCount: formData.startupRegistered.count,
          registeredProof: formData.startupRegistered.proof,
          marks: scores.startupScore,
          verified_marks: verifiedScores.startup?.marks || 0
        },
      },
      15: {
        awardsAndFellowships: {
          internationalAwardsCount: formData.internationalAwards.count,
          internationalAwardsProof: formData.internationalAwards.proof,
          governmentAwardsCount: formData.governmentAwards.count,
          governmentAwardsProof: formData.governmentAwards.proof,
          nationalAwardsCount: formData.nationalAwards.count,
          nationalAwardsProof: formData.nationalAwards.proof,
          internationalFellowshipsCount:
            formData.internationalFellowships.count,
          internationalFellowshipsProof:
            formData.internationalFellowships.proof,
          nationalFellowshipsCount: formData.nationalFellowships.count,
          nationalFellowshipsProof: formData.nationalFellowships.proof,
          marks: scores.awardFellowshipScore,
          verified_marks: verifiedScores.awardsAndFellowships?.marks || 0
        },
      },
      16: {
        industryInteraction: {
          moUsCount: formData.activeMoUs.count,
          moUsProof: formData.activeMoUs.proof,
          collaborationCount: formData.industryCollaboration.count,
          collaborationProof: formData.industryCollaboration.proof,
          marks: scores.interactionScore,
          verified_marks: verifiedScores.industryInteraction?.marks || 0
        },
      },
      17: {
        internshipPlacement: {
          offersCount: formData.internshipPlacementOffers.count,
          offersProof: formData.internshipPlacementOffers.proof,
          marks: scores.internshipPlacementScore,
          verified_marks: verifiedScores.internshipPlacement?.marks || 0
        },
      },
      total_marks: scores.totalScore,
      final_verified_marks: Object.values(verifiedScores).reduce((total, section) => {
        return total + (section?.marks || 0);
      }, 0)
    };

    async function verifyResearch(department, userId, verifierId) {
      try {
        const verifyResponse = await fetch(
          `http://127.0.0.1:5000/${department}/${userId}/${verifierId}/verify-research`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              verified: true,
              timestamp: new Date().toISOString()
            })
          }
        );
    
        if (verifyResponse.ok) {
          console.log("Research verification successful");
          return await verifyResponse.json();
        } else {
          console.error("Research verification failed:", verifyResponse.status);
          throw new Error(`Verification failed with status: ${verifyResponse.status}`);
        }
      } catch (error) {
        console.error("Error during research verification:", error);
        throw error;
      }
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/${department}/${facultyId}/B`,
        {
          method: "POST",
          headers: {
        "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        await verifyResearch(department, userData._id, facultyId);
      }

      if (response.ok) {
        navigate("/submission-status", {
          state: {
            status: "success",
            formName: "Research and Development Form",
            message: "Your research details have been successfully submitted!",
          },
        });
      } else {
        throw new Error("Failed to submit data");
      }
    } catch (error) {
      navigate("/submission-status", {
        state: {
          status: "error",
          formName: "Research and Development Form",
          error: error.message,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader color="#4F46E5" size={50} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Papers Published in Quality Journal */}
      <SectionCard
        title="1. Papers Published in Quality Journal (Being among First Two Authors)"
        icon="📝"
        borderColor="border-blue-500"
      >
        <div className="space-y-4">
          <InputFieldWithProof
            label="SCI/SCIE Journal (WoS) Papers (100 marks per paper)"
            name="sciJournalPapers"
            value={formData.sciJournalPapers.count}
            proofValue={formData.sciJournalPapers.proof}
            verifiedScore={verifiedScores.sciJournalPapers?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                sciJournalPapers: { marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="ESCI Journal (WoS) Papers (50 marks per paper)"
            name="esciJournalPapers"
            value={formData.esciJournalPapers.count}
            proofValue={formData.esciJournalPapers.proof}
            verifiedScore={verifiedScores.esciJournalPapers?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                esciJournalPapers: { marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="Scopus Journal Papers (50 marks per paper)"
            name="scopusJournalPapers"
            value={formData.scopusJournalPapers.count}
            proofValue={formData.scopusJournalPapers.proof}
            verifiedScore={verifiedScores.scopusJournalPapers?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                scopusJournalPapers: { marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="UGC CARE Listed Journal Papers (10 marks per paper)"
            name="ugcCareJournalPapers"
            value={formData.ugcCareJournalPapers.count}
            proofValue={formData.ugcCareJournalPapers.proof}
            verifiedScore={verifiedScores.ugcCareJournalPapers?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                ugcCareJournalPapers: { marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="Other Journal Papers (5 marks per paper)"
            name="otherJournalPapers"
            value={formData.otherJournalPapers.count}
            proofValue={formData.otherJournalPapers.proof}
            verifiedScore={verifiedScores.otherJournalPapers?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                otherJournalPapers: { marks: value },
              }))
            }
          />
        </div>
        <ScoreCard
          label="Quality Journal Papers Score"
          score={scores.journalPapersScore}
          total="No limit"
          verifiedScore={verifiedScores.journalPapers?.marks}
          sectionVerifiedScores={{
            sciJournalPapers: verifiedScores.sciJournalPapers,
            esciJournalPapers: verifiedScores.esciJournalPapers,
            scopusJournalPapers: verifiedScores.scopusJournalPapers,
            ugcCareJournalPapers: verifiedScores.ugcCareJournalPapers,
            otherJournalPapers: verifiedScores.otherJournalPapers
          }}
          onVerifiedScoreChange={(value) =>
            setVerifiedScores((prev) => ({
              ...prev,
              journalPapers: { marks: value },
            }))
          }
        />
      </SectionCard>

      {/* Paper Publication in International Conference */}
      <SectionCard
        title="2. Paper Publication in International Conference (Being among First Two Authors)"
        icon="🎤"
        borderColor="border-green-500"
      >
        <div className="space-y-4">
          <InputFieldWithProof
            label="Papers Indexed in Scopus/WoS (30 marks per paper)"
            name="scopusWosConferencePapers"
            value={formData.scopusWosConferencePapers.count}
            proofValue={formData.scopusWosConferencePapers.proof}
            verifiedScore={verifiedScores.scopusWosConferencePapers?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                scopusWosConferencePapers: { ...prev.scopusWosConferencePapers, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="Other Conference Papers (5 marks per paper)"
            name="otherConferencePapers"
            value={formData.otherConferencePapers.count}
            proofValue={formData.otherConferencePapers.proof}
            verifiedScore={verifiedScores.otherConferencePapers?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                otherConferencePapers: { ...prev.otherConferencePapers, marks: value },
              }))
            }
          />
        </div>
        <ScoreCard
          label="Conference Papers Score"
          score={scores.conferencePapersScore}
          total="180"
          verifiedScore={verifiedScores.conferencePapers?.marks}
          sectionVerifiedScores={{
            scopusWosConferencePapers: verifiedScores.scopusWosConferencePapers,
            otherConferencePapers: verifiedScores.otherConferencePapers
          }}
          onVerifiedScoreChange={(value) =>
            setVerifiedScores((prev) => ({
              ...prev,
              conferencePapers: { marks: value },
            }))
          }
        />
      </SectionCard>

      {/* Book Chapter Publication */}
      <SectionCard
        title="3. Book Chapter Publication (Being among First Two Authors)"
        icon="📚"
        borderColor="border-purple-500"
      >
        <div className="space-y-4">
          <InputFieldWithProof
            label="Book Chapters Indexed in Scopus/WoS (30 marks per chapter)"
            name="scopusWosBooksChapters"
            value={formData.scopusWosBooksChapters.count}
            proofValue={formData.scopusWosBooksChapters.proof}
            verifiedScore={verifiedScores.scopusWosBooksChapters?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                scopusWosBooksChapters: { ...prev.scopusWosBooksChapters, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="Other Book Chapters (5 marks per chapter)"
            name="otherBooksChapters"
            value={formData.otherBooksChapters.count}
            proofValue={formData.otherBooksChapters.proof}
            verifiedScore={verifiedScores.otherBooksChapters?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                otherBooksChapters: { ...prev.otherBooksChapters, marks: value },
              }))
            }
          />
        </div>
        <ScoreCard
          label="Book Chapters Score"
          score={scores.bookChaptersScore}
          total="150"
          verifiedScore={verifiedScores.bookChapters?.marks}
          sectionVerifiedScores={{
            scopusWosBooksChapters: verifiedScores.scopusWosBooksChapters,
            otherBooksChapters: verifiedScores.otherBooksChapters
          }}
          onVerifiedScoreChange={(value) =>
            setVerifiedScores((prev) => ({
              ...prev,
              bookChapters: { marks: value },
            }))
          }
        />
      </SectionCard>

      {/* Book Publication */}
      <SectionCard
        title="4. Book Publication (as Author)"
        icon="📖"
        borderColor="border-yellow-500"
      >
        <div className="space-y-4">
          <InputFieldWithProof
            label="Books Published with International Publisher and Indexed in Scopus/WoS (100 marks per book)"
            name="scopusWosBooks"
            value={formData.scopusWosBooks.count}
            proofValue={formData.scopusWosBooks.proof}
            verifiedScore={verifiedScores.scopusWosBooks?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                scopusWosBooks: { ...prev.scopusWosBooks, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="Books Published with International/National Publisher (non-indexed) (30 marks per book)"
            name="nonIndexedIntlNationalBooks"
            value={formData.nonIndexedIntlNationalBooks.count}
            proofValue={formData.nonIndexedIntlNationalBooks.proof}
            verifiedScore={verifiedScores.nonIndexedIntlNationalBooks?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                nonIndexedIntlNationalBooks: { ...prev.nonIndexedIntlNationalBooks, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="Books Published with Local Publisher (10 marks per book)"
            name="localPublisherBooks"
            value={formData.localPublisherBooks.count}
            proofValue={formData.localPublisherBooks.proof}
            verifiedScore={verifiedScores.localPublisherBooks?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                localPublisherBooks: { ...prev.localPublisherBooks, marks: value },
              }))
            }
          />
        </div>
        <ScoreCard
          label="Books Score"
          score={scores.booksScore}
          total="200"
          verifiedScore={verifiedScores.books?.marks}
          sectionVerifiedScores={{
            scopusWosBooks: verifiedScores.scopusWosBooks,
            nonIndexedIntlNationalBooks: verifiedScores.nonIndexedIntlNationalBooks,
            localPublisherBooks: verifiedScores.localPublisherBooks
          }}
          onVerifiedScoreChange={(value) =>
            setVerifiedScores((prev) => ({
              ...prev,
              books: { marks: value },
            }))
          }
        />
      </SectionCard>

      {/* Last three Years Citations */}
      <SectionCard
        title="5. Last three Years Citations"
        icon="📊"
        borderColor="border-red-500"
      >
        <div className="space-y-4">
          <InputFieldWithProof
            label="Web of Science Citations (3 marks per 3 citations)"
            name="webOfScienceCitations"
            value={formData.webOfScienceCitations.count}
            proofValue={formData.webOfScienceCitations.proof}
            verifiedScore={verifiedScores.webOfScienceCitations?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                webOfScienceCitations: { ...prev.webOfScienceCitations, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="Scopus Citations (3 marks per 3 citations)"
            name="scopusCitations"
            value={formData.scopusCitations.count}
            proofValue={formData.scopusCitations.proof}
            verifiedScore={verifiedScores.scopusCitations?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                scopusCitations: { ...prev.scopusCitations, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="Google Scholar Citations (1 mark per 3 citations)"
            name="googleScholarCitations"
            value={formData.googleScholarCitations.count}
            proofValue={formData.googleScholarCitations.proof}
            verifiedScore={verifiedScores.googleScholarCitations?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                googleScholarCitations: { ...prev.googleScholarCitations, marks: value },
              }))
            }
          />
        </div>
        <ScoreCard
          label="Citations Score"
          score={scores.citationsScore}
          total="50"
          verifiedScore={verifiedScores.citations?.marks}
          sectionVerifiedScores={{
            webOfScienceCitations: verifiedScores.webOfScienceCitations,
            scopusCitations: verifiedScores.scopusCitations,
            googleScholarCitations: verifiedScores.googleScholarCitations
          }}
          onVerifiedScoreChange={(value) =>
            setVerifiedScores((prev) => ({
              ...prev,
              citations: { marks: value },
            }))
          }
        />
      </SectionCard>

      {/* Copyright in Individual Name */}
      <SectionCard
        title="6. Copyright in Individual Name (Being Among first Three Inventors)"
        icon="©️"
        borderColor="border-indigo-500"
      >
        <div className="space-y-4">
          <InputFieldWithProof
            label="Indian Copyright Registered/Filed (5 marks per copyright)"
            name="indianCopyrightRegistered"
            value={formData.indianCopyrightRegistered.count}
            proofValue={formData.indianCopyrightRegistered.proof}
            verifiedScore={verifiedScores.indianCopyrightRegistered?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                indianCopyrightRegistered: { ...prev.indianCopyrightRegistered, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="Indian Copyright Granted (15 marks per copyright)"
            name="indianCopyrightGranted"
            value={formData.indianCopyrightGranted.count}
            proofValue={formData.indianCopyrightGranted.proof}
            verifiedScore={verifiedScores.indianCopyrightGranted?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                indianCopyrightGranted: { ...prev.indianCopyrightGranted, marks: value },
              }))
            }
          />
        </div>
        <ScoreCard
          label="Copyright Individual Score"
          score={scores.copyrightIndividualScore}
          total="30"
          verifiedScore={verifiedScores.copyrightIndividual?.marks}
          sectionVerifiedScores={{
            indianCopyrightRegistered: verifiedScores.indianCopyrightRegistered,
            indianCopyrightGranted: verifiedScores.indianCopyrightGranted
          }}
          onVerifiedScoreChange={(value) =>
            setVerifiedScores((prev) => ({
              ...prev,
              copyrightIndividual: {
                ...prev.copyrightIndividual,
                marks: value,
              },
            }))
          }
        />
      </SectionCard>

      {/* Copyright in Institute Name */}
      <SectionCard
        title="7. Copyright in Institute Name (Being Among first Three Authors)"
        icon="©️"
        borderColor="border-blue-500"
      >
        <div className="space-y-4">
          <InputFieldWithProof
            label="Indian Copyright Registered/Filed (10 marks per copyright)"
            name="indianCopyrightRegisteredInstitute"
            value={formData.indianCopyrightRegisteredInstitute.count}
            proofValue={formData.indianCopyrightRegisteredInstitute.proof}
            verifiedScore={verifiedScores.indianCopyrightRegisteredInstitute?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                indianCopyrightRegisteredInstitute: { ...prev.indianCopyrightRegisteredInstitute, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="Indian Copyright Granted (30 marks per copyright)"
            name="indianCopyrightGrantedInstitute"
            value={formData.indianCopyrightGrantedInstitute.count}
            proofValue={formData.indianCopyrightGrantedInstitute.proof}
            verifiedScore={verifiedScores.indianCopyrightGrantedInstitute?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                indianCopyrightGrantedInstitute: { ...prev.indianCopyrightGrantedInstitute, marks: value },
              }))
            }
          />
        </div>
        <ScoreCard
          label="Copyright Institute Score"
          score={scores.copyrightInstituteScore}
          total="No limit"
          verifiedScore={verifiedScores.copyrightInstitute?.marks}
          sectionVerifiedScores={{
            indianCopyrightRegisteredInstitute: verifiedScores.indianCopyrightRegisteredInstitute,
            indianCopyrightGrantedInstitute: verifiedScores.indianCopyrightGrantedInstitute
          }}
          onVerifiedScoreChange={(value) =>
            setVerifiedScores((prev) => ({
              ...prev,
              copyrightInstitute: { marks: value },
            }))
          }
        />
      </SectionCard>

      {/* Patent in Individual name */}
      <SectionCard
        title="8. Patent in Individual name (Being among First Three inventors)"
        icon="🔖"
        borderColor="border-green-500"
      >
        <div className="space-y-4">
          <InputFieldWithProof
            label="Indian Patent Registered/Filed (15 marks per patent)"
            name="indianPatentRegistered"
            value={formData.indianPatentRegistered.count}
            proofValue={formData.indianPatentRegistered.proof}
            verifiedScore={verifiedScores.indianPatentRegistered?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                indianPatentRegistered: { ...prev.indianPatentRegistered, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="Indian Patent Published (30 marks per patent)"
            name="indianPatentPublished"
            value={formData.indianPatentPublished.count}
            proofValue={formData.indianPatentPublished.proof}
            verifiedScore={verifiedScores.indianPatentPublished?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                indianPatentPublished: { ...prev.indianPatentPublished, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="Indian Patent Granted (50 marks per patent)"
            name="indianPatentGranted"
            value={formData.indianPatentGranted.count}
            proofValue={formData.indianPatentGranted.proof}
            verifiedScore={verifiedScores.indianPatentGranted?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                indianPatentGranted: { ...prev.indianPatentGranted, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="Indian Patent Commercialized (100 marks per patent)"
            name="indianPatentCommercialized"
            value={formData.indianPatentCommercialized.count}
            proofValue={formData.indianPatentCommercialized.proof}
            verifiedScore={verifiedScores.indianPatentCommercialized?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                indianPatentCommercialized: { ...prev.indianPatentCommercialized, marks: value },
              }))
            }
          />
        </div>
        <ScoreCard
          label="Patent Individual Score"
          score={scores.patentIndividualScore}
          total="100"
          verifiedScore={verifiedScores.patentIndividual?.marks}
          sectionVerifiedScores={{
            indianPatentRegistered: verifiedScores.indianPatentRegistered,
            indianPatentPublished: verifiedScores.indianPatentPublished,
            indianPatentGranted: verifiedScores.indianPatentGranted,
            indianPatentCommercialized: verifiedScores.indianPatentCommercialized
          }}
          onVerifiedScoreChange={(value) =>
            setVerifiedScores((prev) => ({
              ...prev,
              patentIndividual: { marks: value },
            }))
          }
        />
      </SectionCard>

      {/* Patent in Institute name */}
      <SectionCard
        title="9. Patent in Institute name (Being among First Three inventors)"
        icon="🔖"
        borderColor="border-purple-500"
      >
        <div className="space-y-4">
          <InputFieldWithProof
            label="Indian Patent Registered/Filed (30 marks per patent)"
            name="indianPatentRegisteredInstitute"
            value={formData.indianPatentRegisteredInstitute.count}
            proofValue={formData.indianPatentRegisteredInstitute.proof}
            verifiedScore={verifiedScores.indianPatentRegisteredInstitute?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                indianPatentRegisteredInstitute: { ...prev.indianPatentRegisteredInstitute, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="Indian Patent Published (60 marks per patent)"
            name="indianPatentPublishedInstitute"
            value={formData.indianPatentPublishedInstitute.count}
            proofValue={formData.indianPatentPublishedInstitute.proof}
            verifiedScore={verifiedScores.indianPatentPublishedInstitute?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                indianPatentPublishedInstitute: { ...prev.indianPatentPublishedInstitute, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="Indian Patent Granted (100 marks per patent)"
            name="indianPatentGrantedInstitute"
            value={formData.indianPatentGrantedInstitute.count}
            proofValue={formData.indianPatentGrantedInstitute.proof}
            verifiedScore={verifiedScores.indianPatentGrantedInstitute?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                indianPatentGrantedInstitute: { ...prev.indianPatentGrantedInstitute, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="Indian Patent Commercialized (200 marks per patent)"
            name="indianPatentCommercializedInstitute"
            value={formData.indianPatentCommercializedInstitute.count}
            proofValue={formData.indianPatentCommercializedInstitute.proof}
            verifiedScore={verifiedScores.indianPatentCommercializedInstitute?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                indianPatentCommercializedInstitute: { ...prev.indianPatentCommercializedInstitute, marks: value },
              }))
            }
          />
        </div>
        <ScoreCard
          label="Patent Institute Score"
          score={scores.patentInstituteScore}
          total="No limit"
          verifiedScore={verifiedScores.patentInstitute?.marks}
          sectionVerifiedScores={{
            indianPatentRegisteredInstitute: verifiedScores.indianPatentRegisteredInstitute,
            indianPatentPublishedInstitute: verifiedScores.indianPatentPublishedInstitute,
            indianPatentGrantedInstitute: verifiedScores.indianPatentGrantedInstitute,
            indianPatentCommercializedInstitute: verifiedScores.indianPatentCommercializedInstitute
          }}
          onVerifiedScoreChange={(value) =>
            setVerifiedScores((prev) => ({
              ...prev,
              patentInstitute: { marks: value },
            }))
          }
        />
      </SectionCard>

      {/* Grants received for research projects */}
      <SectionCard
        title="10. Grants received for research projects"
        icon="💰"
        borderColor="border-yellow-500"
      >
        <div className="space-y-4">
          <InputFieldWithProof
            label="Research Grants (10 marks per Two Lakh Rupees)"
            name="researchGrants"
            value={formData.researchGrants.amount}
            proofValue={formData.researchGrants.proof}
            verifiedScore={verifiedScores.researchGrants?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                researchGrants: { ...prev.researchGrants, marks: value },
              }))
            }
          />
        </div>
        <ScoreCard
          label="Research Grants Score"
          score={scores.researchGrantsScore}
          total="No limit"
          verifiedScore={verifiedScores.researchGrants?.marks}
          sectionVerifiedScores={{
            researchGrants: verifiedScores.researchGrants
          }}
          onVerifiedScoreChange={(value) =>
            setVerifiedScores((prev) => ({
              ...prev,
              researchGrants: { marks: value },
            }))
          }
        />
      </SectionCard>

      {/* Revenue Generated through Training Programs */}
      <SectionCard
        title="11. Revenue Generated through Training Programs"
        icon="💲"
        borderColor="border-red-500"
      >
        <div className="space-y-4">
          <InputFieldWithProof
            label="Training Programs Revenue (5 marks per 10,000 Rupees)"
            name="trainingProgramsRevenue"
            value={formData.trainingProgramsRevenue.amount}
            proofValue={formData.trainingProgramsRevenue.proof}
            verifiedScore={verifiedScores.trainingProgramsRevenue?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                trainingProgramsRevenue: { ...prev.trainingProgramsRevenue, marks: value },
              }))
            }
          />
        </div>
        <ScoreCard
          label="Training Programs Revenue Score"
          score={scores.trainingRevenueScore}
          total="40"
          verifiedScore={verifiedScores.trainingPrograms?.marks}
          sectionVerifiedScores={{
            trainingProgramsRevenue: verifiedScores.trainingProgramsRevenue
          }}
          onVerifiedScoreChange={(value) =>
            setVerifiedScores((prev) => ({
              ...prev,
              trainingPrograms: { marks: value },
            }))
          }
        />
      </SectionCard>

      {/* Non-research/ Non consultancy Grant */}
      <SectionCard
        title="12. Non-research/ Non consultancy Grant"
        icon="💵"
        borderColor="border-indigo-500"
      >
        <div className="space-y-4">
          <InputFieldWithProof
            label="Non-Research Grants (5 marks per 10,000 Rupees)"
            name="nonResearchGrants"
            value={formData.nonResearchGrants.amount}
            proofValue={formData.nonResearchGrants.proof}
            verifiedScore={verifiedScores.nonResearchGrants?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                nonResearchGrants: { ...prev.nonResearchGrants, marks: value },
              }))
            }
          />
        </div>
        <ScoreCard
          label="Non-Research Grants Score"
          score={scores.nonResearchGrantsScore}
          total="40"
          verifiedScore={verifiedScores.nonResearchGrants?.marks}
          sectionVerifiedScores={{
            nonResearchGrants: verifiedScores.nonResearchGrants
          }}
          onVerifiedScoreChange={(value) =>
            setVerifiedScores((prev) => ({
              ...prev,
              nonResearchGrants: { marks: value },
            }))
          }
        />
      </SectionCard>

      {/* Product Developed with PCCoE-CIIL Stake */}
      <SectionCard
        title="13. Product Developed with PCCoE-CIIL Stake"
        icon="🛠️"
        borderColor="border-blue-500"
      >
        <div className="space-y-4">
          <InputFieldWithProof
            label="Commercialized Products (100 marks per product)"
            name="commercializedProducts"
            value={formData.commercializedProducts.count}
            proofValue={formData.commercializedProducts.proof}
            verifiedScore={verifiedScores.commercializedProducts?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                commercializedProducts: { ...prev.commercializedProducts, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="Developed Products (40 marks per product)"
            name="developedProducts"
            value={formData.developedProducts.count}
            proofValue={formData.developedProducts.proof}
            verifiedScore={verifiedScores.developedProducts?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                developedProducts: { ...prev.developedProducts, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="Proof of Concepts (10 marks per POC)"
            name="proofOfConcepts"
            value={formData.proofOfConcepts.count}
            proofValue={formData.proofOfConcepts.proof}
            verifiedScore={verifiedScores.proofOfConcepts?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                proofOfConcepts: { ...prev.proofOfConcepts, marks: value },
              }))
            }
          />
        </div>
        <ScoreCard
          label="Product Development Score"
          score={scores.productDevelopedScore}
          total="100"
          verifiedScore={verifiedScores.productDevelopment?.marks}
          sectionVerifiedScores={{
            commercializedProducts: verifiedScores.commercializedProducts,
            developedProducts: verifiedScores.developedProducts,
            proofOfConcepts: verifiedScores.proofOfConcepts
          }}
          onVerifiedScoreChange={(value) =>
            setVerifiedScores((prev) => ({
              ...prev,
              productDevelopment: { marks: value },
            }))
          }
        />
      </SectionCard>

      {/* Start Up with PCCoE-CIIL Stake */}
      <SectionCard
        title="14. Start Up with PCCoE-CIIL Stake"
        icon="🚀"
        borderColor="border-green-500"
      >
        <div className="space-y-4">
          <InputFieldWithProof
            label="Startup with Revenue > 50k (100 marks per startup)"
            name="startupRevenueFiftyK"
            value={formData.startupRevenueFiftyK.count}
            proofValue={formData.startupRevenueFiftyK.proof}
            verifiedScore={verifiedScores.startupRevenueFiftyK?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                startupRevenueFiftyK: { ...prev.startupRevenueFiftyK, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="Startup with Funds > 5 Lakhs (100 marks per startup)"
            name="startupFundsFiveLakhs"
            value={formData.startupFundsFiveLakhs.count}
            proofValue={formData.startupFundsFiveLakhs.proof}
            verifiedScore={verifiedScores.startupFundsFiveLakhs?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                startupFundsFiveLakhs: { ...prev.startupFundsFiveLakhs, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="Startup Products (40 marks per product)"
            name="startupProducts"
            value={formData.startupProducts.count}
            proofValue={formData.startupProducts.proof}
            verifiedScore={verifiedScores.startupProducts?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                startupProducts: { ...prev.startupProducts, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="Startup POCs (10 marks per POC)"
            name="startupPOCs"
            value={formData.startupPOCs.count}
            proofValue={formData.startupPOCs.proof}
            verifiedScore={verifiedScores.startupPOCs?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                startupPOCs: { ...prev.startupPOCs, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="Registered Startups (5 marks per startup)"
            name="startupRegistered"
            value={formData.startupRegistered.count}
            proofValue={formData.startupRegistered.proof}
            verifiedScore={verifiedScores.startupRegistered?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                startupRegistered: { ...prev.startupRegistered, marks: value },
              }))
            }
          />
        </div>
        <ScoreCard
          label="Startup Score"
          score={scores.startupScore}
          total="No limit"
          verifiedScore={verifiedScores.startup?.marks}
          sectionVerifiedScores={{
            startupRevenueFiftyK: verifiedScores.startupRevenueFiftyK,
            startupFundsFiveLakhs: verifiedScores.startupFundsFiveLakhs,
            startupProducts: verifiedScores.startupProducts,
            startupPOCs: verifiedScores.startupPOCs,
            startupRegistered: verifiedScores.startupRegistered
          }}
          onVerifiedScoreChange={(value) =>
            setVerifiedScores((prev) => ({
              ...prev,
              startup: { marks: value },
            }))
          }
        />
      </SectionCard>

      {/* Award/ Fellowship Received */}
      <SectionCard
        title="15. Award/ Fellowship Received"
        icon="🏆"
        borderColor="border-purple-500"
      >
        <div className="space-y-4">
          <InputFieldWithProof
            label="International Awards (30 marks per award)"
            name="internationalAwards"
            value={formData.internationalAwards.count}
            proofValue={formData.internationalAwards.proof}
            verifiedScore={verifiedScores.internationalAwards?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                internationalAwards: { ...prev.internationalAwards, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="Government Awards (20 marks per award)"
            name="governmentAwards"
            value={formData.governmentAwards.count}
            proofValue={formData.governmentAwards.proof}
            verifiedScore={verifiedScores.governmentAwards?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                governmentAwards: { ...prev.governmentAwards, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="National Awards (5 marks per award)"
            name="nationalAwards"
            value={formData.nationalAwards.count}
            proofValue={formData.nationalAwards.proof}
            verifiedScore={verifiedScores.nationalAwards?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                nationalAwards: { ...prev.nationalAwards, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="International Fellowships (50 marks per fellowship)"
            name="internationalFellowships"
            value={formData.internationalFellowships.count}
            proofValue={formData.internationalFellowships.proof}
            verifiedScore={verifiedScores.internationalFellowships?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                internationalFellowships: { ...prev.internationalFellowships, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="National Fellowships (30 marks per fellowship)"
            name="nationalFellowships"
            value={formData.nationalFellowships.count}
            proofValue={formData.nationalFellowships.proof}
            verifiedScore={verifiedScores.nationalFellowships?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                nationalFellowships: { ...prev.nationalFellowships, marks: value },
              }))
            }
          />
        </div>
        <ScoreCard
          label="Awards & Fellowships Score"
          score={scores.awardFellowshipScore}
          total="50"
          verifiedScore={verifiedScores.awardsAndFellowships?.marks}
          sectionVerifiedScores={{
            internationalAwards: verifiedScores.internationalAwards,
            governmentAwards: verifiedScores.governmentAwards,
            nationalAwards: verifiedScores.nationalAwards,
            internationalFellowships: verifiedScores.internationalFellowships,
            nationalFellowships: verifiedScores.nationalFellowships
          }}
          onVerifiedScoreChange={(value) =>
            setVerifiedScores((prev) => ({
              ...prev,
              awardsAndFellowships: {
                ...prev.awardsAndFellowships,
                marks: value,
              },
            }))
          }
        />
      </SectionCard>

      {/* National/International Industry/University Interaction */}
      <SectionCard
        title="16. Outcome through National/International Industry/University Interaction"
        icon="🤝"
        borderColor="border-yellow-500"
      >
        <div className="space-y-4">
          <InputFieldWithProof
            label="Active MoUs (10 marks per MoU)"
            name="activeMoUs"
            value={formData.activeMoUs.count}
            proofValue={formData.activeMoUs.proof}
            verifiedScore={verifiedScores.activeMoUs?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                activeMoUs: { ...prev.activeMoUs, marks: value },
              }))
            }
          />
          <InputFieldWithProof
            label="Industry Collaboration (20 marks per collaboration)"
            name="industryCollaboration"
            value={formData.industryCollaboration.count}
            proofValue={formData.industryCollaboration.proof}
            verifiedScore={verifiedScores.industryCollaboration?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                industryCollaboration: { ...prev.industryCollaboration, marks: value },
              }))
            }
          />
        </div>
        <ScoreCard
          label="Industry/University Interaction Score"
          score={scores.interactionScore}
          total="No limit"
          verifiedScore={verifiedScores.industryInteraction?.marks}
          sectionVerifiedScores={{
            activeMoUs: verifiedScores.activeMoUs,
            industryCollaboration: verifiedScores.industryCollaboration
          }}
          onVerifiedScoreChange={(value) =>
            setVerifiedScores((prev) => ({
              ...prev,
              industryInteraction: {
                ...prev.industryInteraction,
                marks: value,
              },
            }))
          }
        />
      </SectionCard>

      {/* Industry association for internship/placement */}
      <SectionCard
        title="17. Industry association for internship/placement"
        icon="🎯"
        borderColor="border-red-500"
      >
        <div className="space-y-4">
          <InputFieldWithProof
            label="Internship/Placement Offers (10 marks per offer)"
            name="internshipPlacementOffers"
            value={formData.internshipPlacementOffers.count}
            proofValue={formData.internshipPlacementOffers.proof}
            verifiedScore={verifiedScores.internshipPlacementOffers?.marks}
            onVerifiedScoreChange={(value) =>
              setVerifiedScores((prev) => ({
                ...prev,
                internshipPlacementOffers: { ...prev.internshipPlacementOffers, marks: value },
              }))
            }
          />
        </div>
        <ScoreCard
          label="Internship/Placement Score"
          score={scores.internshipPlacementScore}
          total="No limit"
          verifiedScore={verifiedScores.internshipPlacement?.marks}
          sectionVerifiedScores={{
            internshipPlacementOffers: verifiedScores.internshipPlacementOffers
          }}
          onVerifiedScoreChange={(value) =>
            setVerifiedScores((prev) => ({
              ...prev,
              internshipPlacement: {
                ...prev.internshipPlacement,
                marks: value,
              },
            }))
          }
        />
      </SectionCard>

      {/* Total Scores */}
      <SectionCard title="Total Scores" icon="📊" borderColor="border-blue-500">
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-lg font-semibold text-blue-800">
              Score before cadre limit: {scores.totalScoreBeforeCadreLimit}
            </p>
            <p className="text-lg font-semibold text-blue-800 mt-2">
              Final Score (after cadre limit): {scores.totalScore}
            </p>
            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">
                  Total Score After Verification:
                </span>
                <span className="text-xl font-bold text-green-600">
                  {Object.values(verifiedScores).reduce((total, section) => {
                    return total + (section?.marks || 0);
                  }, 0)}
                </span>
              </div>
            </div>
            <p className="text-sm text-blue-600 mt-4">
              Maximum score limits: Professor - 370, Associate Professor - 300,
              Assistant Professor - 210
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Submit Button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <ClipLoader color="#ffffff" size={20} />
              Submitting...
            </>
          ) : (
            "Submit After Varification"
          )}
        </button>
      </div>
    </div>
  );
};

const getJournalPapersVerifiedTotal = () => {
  return (
    (verifiedScores.sciJournalPapers?.marks || 0) +
    (verifiedScores.esciJournalPapers?.marks || 0) +
    (verifiedScores.scopusJournalPapers?.marks || 0) +
    (verifiedScores.ugcCareJournalPapers?.marks || 0) +
    (verifiedScores.otherJournalPapers?.marks || 0)
  );
};

export default VerificationForm;
