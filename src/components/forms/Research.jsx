import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const ScoreCard = ({ label, score, total, verifiedScore }) => (
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
          {verifiedScore || "Pending"}
        </span>
      </div>
    </div>
  </div>
);

const InputFieldWithProof = ({
  label,
  name,
  type = "number",
  value,
  onChange,
  placeholder,
  proofValue,
  onProofChange,
  verifiedScore,
  disabled = false,
}) => (
  <div className="mb-4">
    <div className="flex items-center gap-4 mb-1">
      <label className="text-sm font-medium text-gray-700 w-1/6">{label}</label>
      <label className="text-sm font-medium text-gray-700 flex-1">
        Proof Document
      </label>
      <label
        className="text-sm font-medium text-gray-700"
        style={{ width: "3cm" }}
      >
        Verified Score
      </label>
    </div>
    <div className="flex items-center gap-2">
      <input
        type={type}
        name={name}
        value={value === 0 ? "" : value}
        onChange={(e) => {
          const newValue = e.target.value;
          const cleanValue = newValue.replace(/^0+/, "") || "0";
          onChange({
            ...e,
            target: {
              ...e.target,
              value: cleanValue === "" ? 0 : parseInt(cleanValue, 10),
            },
          });
        }}
        placeholder={placeholder}
        disabled={disabled}
        min="0"
        onKeyDown={(e) => {
          if (e.key === "-") {
            e.preventDefault();
          }
        }}
        onWheel={(e) => e.target.blur()}
        className="w-1/6 px-4 py-2 bg-blue-50 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <input
        type="url"
        value={proofValue}
        onChange={onProofChange}
        placeholder="Proof Document Link (Google Drive)"
        className="flex-1 px-4 py-2 rounded-md border border-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />
      <input
        type="text"
        value={verifiedScore}
        readOnly
        style={{ width: "3cm" }}
        className="px-4 py-2 rounded-md border border-gray-300 bg-green-100"
      />
    </div>
  </div>
);

const Research = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const userData = JSON.parse(localStorage.getItem("userData"));

  const initialState = {
    // 1. Papers Published in Quality Journal
    sciJournalPapers: { count: 0, proof: "", verifiedScore: 0 },
    esciJournalPapers: { count: 0, proof: "", verifiedScore: 0 },
    scopusJournalPapers: { count: 0, proof: "", verifiedScore: 0 },
    ugcCareJournalPapers: { count: 0, proof: "", verifiedScore: 0 },
    otherJournalPapers: { count: 0, proof: "", verifiedScore: 0 },

    // 2. Papers Published in International Conference
    scopusWosConferencePapers: { count: 0, proof: "", verifiedScore: 0 },
    otherConferencePapers: { count: 0, proof: "", verifiedScore: 0 },

    // 3. Book Chapter Publication
    scopusWosBooksChapters: { count: 0, proof: "", verifiedScore: 0 },
    otherBooksChapters: { count: 0, proof: "", verifiedScore: 0 },

    // 4. Book Publication
    scopusWosBooks: { count: 0, proof: "", verifiedScore: 0 },
    nonIndexedIntlNationalBooks: { count: 0, proof: "", verifiedScore: 0 },
    localPublisherBooks: { count: 0, proof: "", verifiedScore: 0 },

    // 5. Last three Years Citations
    webOfScienceCitations: { count: 0, proof: "", verifiedScore: 0 },
    scopusCitations: { count: 0, proof: "", verifiedScore: 0 },
    googleScholarCitations: { count: 0, proof: "", verifiedScore: 0 },

    // 6. Copyright in Individual Name
    indianCopyrightRegistered: { count: 0, proof: "", verifiedScore: 0 },
    indianCopyrightGranted: { count: 0, proof: "", verifiedScore: 0 },

    // 7. Copyright in Institute Name
    indianCopyrightRegisteredInstitute: {
      count: 0,
      proof: "",
      verifiedScore: 0,
    },
    indianCopyrightGrantedInstitute: { count: 0, proof: "", verifiedScore: 0 },

    // 8. Patent in Individual name
    indianPatentRegistered: { count: 0, proof: "", verifiedScore: 0 },
    indianPatentPublished: { count: 0, proof: "", verifiedScore: 0 },
    indianPatentGranted: { count: 0, proof: "", verifiedScore: 0 },
    indianPatentCommercialized: { count: 0, proof: "", verifiedScore: 0 },

    // 9. Patent in Institute name
    indianPatentRegisteredInstitute: { count: 0, proof: "", verifiedScore: 0 },
    indianPatentPublishedInstitute: { count: 0, proof: "", verifiedScore: 0 },
    indianPatentGrantedInstitute: { count: 0, proof: "", verifiedScore: 0 },
    indianPatentCommercializedInstitute: {
      count: 0,
      proof: "",
      verifiedScore: 0,
    },

    // 10. Grants received for research projects
    researchGrants: { amount: 0, proof: "", verifiedScore: 0 },

    // 11. Revenue Generated through Training Programs
    trainingProgramsRevenue: { amount: 0, proof: "", verifiedScore: 0 },

    // 12. Non-research/ Non consultancy Grant
    nonResearchGrants: { amount: 0, proof: "", verifiedScore: 0 },

    // 13. Product Developed with PCCoE-CIIL Stake
    commercializedProducts: { count: 0, proof: "", verifiedScore: 0 },
    developedProducts: { count: 0, proof: "", verifiedScore: 0 },
    proofOfConcepts: { count: 0, proof: "", verifiedScore: 0 },

    // 14. Start Up with PCCoE-CIIL Stake
    startupRevenueFiftyK: { count: 0, proof: "", verifiedScore: 0 },
    startupFundsFiveLakhs: { count: 0, proof: "", verifiedScore: 0 },
    startupProducts: { count: 0, proof: "", verifiedScore: 0 },
    startupPOCs: { count: 0, proof: "", verifiedScore: 0 },
    startupRegistered: { count: 0, proof: "", verifiedScore: 0 },

    // 15. Award/ Fellowship Received
    internationalAwards: { count: 0, proof: "", verifiedScore: 0 },
    governmentAwards: { count: 0, proof: "", verifiedScore: 0 },
    nationalAwards: { count: 0, proof: "", verifiedScore: 0 },
    internationalFellowships: { count: 0, proof: "", verifiedScore: 0 },
    nationalFellowships: { count: 0, proof: "", verifiedScore: 0 },

    // 16. Outcome through National/ International Industry/ University Interaction
    activeMoUs: { count: 0, proof: "", verifiedScore: 0 },
    industryCollaboration: { count: 0, proof: "", verifiedScore: 0 },

    // 17. Industry association for internship/placement
    internshipPlacementOffers: { count: 0, proof: "", verifiedScore: 0 },
  };

  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifiedScores, setVerifiedScores] = useState({});

  useEffect(() => {
    const transformApiResponse = (data) => {
      const newFormData = { ...initialState };
      const newVerifiedScores = {};

      if (data[1]) {
        newFormData.sciJournalPapers = {
          count: data[1].journalPapers?.sciCount || 0,
          proof: data[1].journalPapers?.sciProof || "",
          verifiedScore: data[1].journalPapers?.verified_marks || 0,
        };
        newFormData.esciJournalPapers = {
          count: data[1].journalPapers?.esciCount || 0,
          proof: data[1].journalPapers?.esciProof || "",
          verifiedScore: data[1].journalPapers?.verified_marks || 0,
        };
        newFormData.scopusJournalPapers = {
          count: data[1].journalPapers?.scopusCount || 0,
          proof: data[1].journalPapers?.scopusProof || "",
          verifiedScore: data[1].journalPapers?.verified_marks || 0,
        };
        newFormData.ugcCareJournalPapers = {
          count: data[1].journalPapers?.ugcCareCount || 0,
          proof: data[1].journalPapers?.ugcCareProof || "",
          verifiedScore: data[1].journalPapers?.verified_marks || 0,
        };
        newFormData.otherJournalPapers = {
          count: data[1].journalPapers?.otherCount || 0,
          proof: data[1].journalPapers?.otherProof || "",
          verifiedScore: data[1].journalPapers?.verified_marks || 0,
        };
        newVerifiedScores.journalPapers = {
          marks: data[1].journalPapers?.marks || 0,
          verified_marks: data[1].journalPapers?.verified_marks || 0,
        };
      }

      if (data[2]) {
        newFormData.scopusWosConferencePapers = {
          count: data[2].conferencePapers?.scopusWosCount || 0,
          proof: data[2].conferencePapers?.scopusWosProof || "",
        };
        newFormData.otherConferencePapers = {
          count: data[2].conferencePapers?.otherCount || 0,
          proof: data[2].conferencePapers?.otherProof || "",
        };
        newVerifiedScores.conferencePapers = {
          marks: data[2].conferencePapers?.marks || 0,
          verified_marks: data[2].conferencePapers?.verified_marks || 0,
        };
      }

      if (data[3]) {
        newFormData.scopusWosBooksChapters = {
          count: data[3].bookChapters?.scopusWosCount || 0,
          proof: data[3].bookChapters?.scopusWosProof || "",
        };
        newFormData.otherBooksChapters = {
          count: data[3].bookChapters?.otherCount || 0,
          proof: data[3].bookChapters?.otherProof || "",
        };
        newVerifiedScores.bookChapters = {
          marks: data[3].bookChapters?.marks || 0,
          verified_marks: data[3].bookChapters?.verified_marks || 0,
        };
      }

      if (data[4]) {
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
        newVerifiedScores.books = {
          marks: data[4].books?.marks || 0,
          verified_marks: data[4].books?.verified_marks || 0,
        };
      }

      if (data[5]) {
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
        newVerifiedScores.citations = {
          marks: data[5].citations?.marks || 0,
          verified_marks: data[5].citations?.verified_marks || 0,
        };
      }

      if (data[6]) {
        newFormData.indianCopyrightRegistered = {
          count: data[6].copyrightIndividual?.registeredCount || 0,
          proof: data[6].copyrightIndividual?.registeredProof || "",
        };
        newFormData.indianCopyrightGranted = {
          count: data[6].copyrightIndividual?.grantedCount || 0,
          proof: data[6].copyrightIndividual?.grantedProof || "",
        };
        newVerifiedScores.copyrightIndividual = {
          marks: data[6].copyrightIndividual?.marks || 0,
          verified_marks: data[6].copyrightIndividual?.verified_marks || 0,
        };
      }

      if (data[7]) {
        newFormData.indianCopyrightRegisteredInstitute = {
          count: data[7].copyrightInstitute?.registeredCount || 0,
          proof: data[7].copyrightInstitute?.registeredProof || "",
        };
        newFormData.indianCopyrightGrantedInstitute = {
          count: data[7].copyrightInstitute?.grantedCount || 0,
          proof: data[7].copyrightInstitute?.grantedProof || "",
        };
        newVerifiedScores.copyrightInstitute = {
          marks: data[7].copyrightInstitute?.marks || 0,
          verified_marks: data[7].copyrightInstitute?.verified_marks || 0,
        };
      }

      if (data[8]) {
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
        newVerifiedScores.patentIndividual = {
          marks: data[8].patentIndividual?.marks || 0,
          verified_marks: data[8].patentIndividual?.verified_marks || 0,
        };
      }

      if (data[9]) {
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
        newVerifiedScores.patentInstitute = {
          marks: data[9].patentInstitute?.marks || 0,
          verified_marks: data[9].patentInstitute?.verified_marks || 0,
        };
      }

      if (data[10]) {
        newFormData.researchGrants = {
          amount: data[10].researchGrants?.amount || 0,
          proof: data[10].researchGrants?.proof || "",
        };
        newVerifiedScores.researchGrants = {
          marks: data[10].researchGrants?.marks || 0,
          verified_marks: data[10].researchGrants?.verified_marks || 0,
        };
      }

      if (data[11]) {
        newFormData.trainingProgramsRevenue = {
          amount: data[11].trainingPrograms?.amount || 0,
          proof: data[11].trainingPrograms?.proof || "",
        };
        newVerifiedScores.trainingPrograms = {
          marks: data[11].trainingPrograms?.marks || 0,
          verified_marks: data[11].trainingPrograms?.verified_marks || 0,
        };
      }

      if (data[12]) {
        newFormData.nonResearchGrants = {
          amount: data[12].nonResearchGrants?.amount || 0,
          proof: data[12].nonResearchGrants?.proof || "",
        };
        newVerifiedScores.nonResearchGrants = {
          marks: data[12].nonResearchGrants?.marks || 0,
          verified_marks: data[12].nonResearchGrants?.verified_marks || 0,
        };
      }

      if (data[13]) {
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
        newVerifiedScores.productDevelopment = {
          marks: data[13].productDevelopment?.marks || 0,
          verified_marks: data[13].productDevelopment?.verified_marks || 0,
        };
      }

      if (data[14]) {
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
        newVerifiedScores.startup = {
          marks: data[14].startup?.marks || 0,
          verified_marks: data[14].startup?.verified_marks || 0,
        };
      }

      if (data[15]) {
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
          count:
            data[15].awardsAndFellowships?.internationalFellowshipsCount || 0,
          proof:
            data[15].awardsAndFellowships?.internationalFellowshipsProof || "",
        };
        newFormData.nationalFellowships = {
          count: data[15].awardsAndFellowships?.nationalFellowshipsCount || 0,
          proof: data[15].awardsAndFellowships?.nationalFellowshipsProof || "",
        };
        newVerifiedScores.awardsAndFellowships = {
          marks: data[15].awardsAndFellowships?.marks || 0,
          verified_marks: data[15].awardsAndFellowships?.verified_marks || 0,
        };
      }

      if (data[16]) {
        newFormData.activeMoUs = {
          count: data[16].industryInteraction?.moUsCount || 0,
          proof: data[16].industryInteraction?.moUsProof || "",
        };
        newFormData.industryCollaboration = {
          count: data[16].industryInteraction?.collaborationCount || 0,
          proof: data[16].industryInteraction?.collaborationProof || "",
        };
        newVerifiedScores.industryInteraction = {
          marks: data[16].industryInteraction?.marks || 0,
          verified_marks: data[16].industryInteraction?.verified_marks || 0,
        };
      }

      if (data[17]) {
        newFormData.internshipPlacementOffers = {
          count: data[17].internshipPlacement?.offersCount || 0,
          proof: data[17].internshipPlacement?.offersProof || "",
        };
        newVerifiedScores.internshipPlacement = {
          marks: data[17].internshipPlacement?.marks || 0,
          verified_marks: data[17].internshipPlacement?.verified_marks || 0,
        };
      }

      return { newFormData, newVerifiedScores };
    };

    const fetchExistingData = async () => {
      setIsLoading(true);
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const department = userData.dept;
        const user_id = userData._id;
        const response = await fetch(
          `http://127.0.0.1:5000/${department}/${user_id}/B`
        );

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          if (data) {
            const { newFormData, newVerifiedScores } =
              transformApiResponse(data);
            setFormData(newFormData);
            setVerifiedScores(newVerifiedScores);
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
        },
      },
      2: {
        conferencePapers: {
          scopusWosCount: formData.scopusWosConferencePapers.count,
          scopusWosProof: formData.scopusWosConferencePapers.proof,
          otherCount: formData.otherConferencePapers.count,
          otherProof: formData.otherConferencePapers.proof,
          marks: scores.conferencePapersScore,
        },
      },
      3: {
        bookChapters: {
          scopusWosCount: formData.scopusWosBooksChapters.count,
          scopusWosProof: formData.scopusWosBooksChapters.proof,
          otherCount: formData.otherBooksChapters.count,
          otherProof: formData.otherBooksChapters.proof,
          marks: scores.bookChaptersScore,
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
        },
      },
      6: {
        copyrightIndividual: {
          registeredCount: formData.indianCopyrightRegistered.count,
          registeredProof: formData.indianCopyrightRegistered.proof,
          grantedCount: formData.indianCopyrightGranted.count,
          grantedProof: formData.indianCopyrightGranted.proof,
          marks: scores.copyrightIndividualScore,
        },
      },
      7: {
        copyrightInstitute: {
          registeredCount: formData.indianCopyrightRegisteredInstitute.count,
          registeredProof: formData.indianCopyrightRegisteredInstitute.proof,
          grantedCount: formData.indianCopyrightGrantedInstitute.count,
          grantedProof: formData.indianCopyrightGrantedInstitute.proof,
          marks: scores.copyrightInstituteScore,
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
        },
      },
      10: {
        researchGrants: {
          amount: formData.researchGrants.amount,
          proof: formData.researchGrants.proof,
          marks: scores.researchGrantsScore,
        },
      },
      11: {
        trainingPrograms: {
          amount: formData.trainingProgramsRevenue.amount,
          proof: formData.trainingProgramsRevenue.proof,
          marks: scores.trainingRevenueScore,
        },
      },
      12: {
        nonResearchGrants: {
          amount: formData.nonResearchGrants.amount,
          proof: formData.nonResearchGrants.proof,
          marks: scores.nonResearchGrantsScore,
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
        },
      },
      16: {
        industryInteraction: {
          moUsCount: formData.activeMoUs.count,
          moUsProof: formData.activeMoUs.proof,
          collaborationCount: formData.industryCollaboration.count,
          collaborationProof: formData.industryCollaboration.proof,
          marks: scores.interactionScore,
        },
      },
      17: {
        internshipPlacement: {
          offersCount: formData.internshipPlacementOffers.count,
          offersProof: formData.internshipPlacementOffers.proof,
          marks: scores.internshipPlacementScore,
        },
      },
      total_marks: scores.totalScore,
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
            onChange={(e) =>
              handleInputChange(
                "sciJournalPapers",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of papers"
            proofValue={formData.sciJournalPapers.proof}
            onProofChange={(e) =>
              handleInputChange("sciJournalPapers", "proof", e.target.value)
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.sciJournalPapers.verifiedScore
            }
          />
          <InputFieldWithProof
            label="ESCI Journal (WoS) Papers (50 marks per paper)"
            name="esciJournalPapers"
            value={formData.esciJournalPapers.count}
            onChange={(e) =>
              handleInputChange(
                "esciJournalPapers",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of papers"
            proofValue={formData.esciJournalPapers.proof}
            onProofChange={(e) =>
              handleInputChange("esciJournalPapers", "proof", e.target.value)
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.esciJournalPapers.verifiedScore
            }
          />
          <InputFieldWithProof
            label="Scopus Journal Papers (50 marks per paper)"
            name="scopusJournalPapers"
            value={formData.scopusJournalPapers.count}
            onChange={(e) =>
              handleInputChange(
                "scopusJournalPapers",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of papers"
            proofValue={formData.scopusJournalPapers.proof}
            onProofChange={(e) =>
              handleInputChange("scopusJournalPapers", "proof", e.target.value)
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.scopusJournalPapers.verifiedScore
            }
          />
          <InputFieldWithProof
            label="UGC CARE Listed Journal Papers (10 marks per paper)"
            name="ugcCareJournalPapers"
            value={formData.ugcCareJournalPapers.count}
            onChange={(e) =>
              handleInputChange(
                "ugcCareJournalPapers",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of papers"
            proofValue={formData.ugcCareJournalPapers.proof}
            onProofChange={(e) =>
              handleInputChange("ugcCareJournalPapers", "proof", e.target.value)
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.ugcCareJournalPapers.verifiedScore
            }
          />
          <InputFieldWithProof
            label="Other Journal Papers (5 marks per paper)"
            name="otherJournalPapers"
            value={formData.otherJournalPapers.count}
            onChange={(e) =>
              handleInputChange(
                "otherJournalPapers",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of papers"
            proofValue={formData.otherJournalPapers.proof}
            onProofChange={(e) =>
              handleInputChange("otherJournalPapers", "proof", e.target.value)
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.otherJournalPapers.verifiedScore
            }
          />
        </div>
        <ScoreCard
          label="Quality Journal Papers Score"
          score={scores.journalPapersScore}
          total="No limit"
          verifiedScore={verifiedScores.journalPapers?.marks}
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
            onChange={(e) =>
              handleInputChange(
                "scopusWosConferencePapers",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of papers"
            proofValue={formData.scopusWosConferencePapers.proof}
            onProofChange={(e) =>
              handleInputChange(
                "scopusWosConferencePapers",
                "proof",
                e.target.value
              )
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.scopusWosConferencePapers.verifiedScore
            }
          />
          <InputFieldWithProof
            label="Other Conference Papers (5 marks per paper)"
            name="otherConferencePapers"
            value={formData.otherConferencePapers.count}
            onChange={(e) =>
              handleInputChange(
                "otherConferencePapers",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of papers"
            proofValue={formData.otherConferencePapers.proof}
            onProofChange={(e) =>
              handleInputChange(
                "otherConferencePapers",
                "proof",
                e.target.value
              )
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.otherConferencePapers.verifiedScore
            }
          />
        </div>
        <ScoreCard
          label="Conference Papers Score"
          score={scores.conferencePapersScore}
          total="180"
          verifiedScore={verifiedScores.conferencePapers?.marks}
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
            onChange={(e) =>
              handleInputChange(
                "scopusWosBooksChapters",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of book chapters"
            proofValue={formData.scopusWosBooksChapters.proof}
            onProofChange={(e) =>
              handleInputChange(
                "scopusWosBooksChapters",
                "proof",
                e.target.value
              )
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.scopusWosBooksChapters.verifiedScore
            }
          />
          <InputFieldWithProof
            label="Other Book Chapters (5 marks per chapter)"
            name="otherBooksChapters"
            value={formData.otherBooksChapters.count}
            onChange={(e) =>
              handleInputChange(
                "otherBooksChapters",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of book chapters"
            proofValue={formData.otherBooksChapters.proof}
            onProofChange={(e) =>
              handleInputChange("otherBooksChapters", "proof", e.target.value)
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.otherBooksChapters.verifiedScore
            }
          />
        </div>
        <ScoreCard
          label="Book Chapters Score"
          score={scores.bookChaptersScore}
          total="150"
          verifiedScore={verifiedScores.bookChapters?.marks}
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
            onChange={(e) =>
              handleInputChange(
                "scopusWosBooks",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of books"
            proofValue={formData.scopusWosBooks.proof}
            onProofChange={(e) =>
              handleInputChange("scopusWosBooks", "proof", e.target.value)
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.scopusWosBooks.verifiedScore
            }
          />
          <InputFieldWithProof
            label="Books Published with International/National Publisher (non-indexed) (30 marks per book)"
            name="nonIndexedIntlNationalBooks"
            value={formData.nonIndexedIntlNationalBooks.count}
            onChange={(e) =>
              handleInputChange(
                "nonIndexedIntlNationalBooks",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of books"
            proofValue={formData.nonIndexedIntlNationalBooks.proof}
            onProofChange={(e) =>
              handleInputChange(
                "nonIndexedIntlNationalBooks",
                "proof",
                e.target.value
              )
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.nonIndexedIntlNationalBooks.verifiedScore
            }
          />
          <InputFieldWithProof
            label="Books Published with Local Publisher (10 marks per book)"
            name="localPublisherBooks"
            value={formData.localPublisherBooks.count}
            onChange={(e) =>
              handleInputChange(
                "localPublisherBooks",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of books"
            proofValue={formData.localPublisherBooks.proof}
            onProofChange={(e) =>
              handleInputChange("localPublisherBooks", "proof", e.target.value)
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.localPublisherBooks.verifiedScore
            }
          />
        </div>
        <ScoreCard
          label="Books Score"
          score={scores.booksScore}
          total="200"
          verifiedScore={verifiedScores.books?.marks}
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
            onChange={(e) =>
              handleInputChange(
                "webOfScienceCitations",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of citations"
            proofValue={formData.webOfScienceCitations.proof}
            onProofChange={(e) =>
              handleInputChange(
                "webOfScienceCitations",
                "proof",
                e.target.value
              )
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.webOfScienceCitations.verifiedScore
            }
          />
          <InputFieldWithProof
            label="Scopus Citations (3 marks per 3 citations)"
            name="scopusCitations"
            value={formData.scopusCitations.count}
            onChange={(e) =>
              handleInputChange(
                "scopusCitations",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of citations"
            proofValue={formData.scopusCitations.proof}
            onProofChange={(e) =>
              handleInputChange("scopusCitations", "proof", e.target.value)
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.scopusCitations.verifiedScore
            }
          />
          <InputFieldWithProof
            label="Google Scholar Citations (1 mark per 3 citations)"
            name="googleScholarCitations"
            value={formData.googleScholarCitations.count}
            onChange={(e) =>
              handleInputChange(
                "googleScholarCitations",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of citations"
            proofValue={formData.googleScholarCitations.proof}
            onProofChange={(e) =>
              handleInputChange(
                "googleScholarCitations",
                "proof",
                e.target.value
              )
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.googleScholarCitations.verifiedScore
            }
          />
        </div>
        <ScoreCard
          label="Citations Score"
          score={scores.citationsScore}
          total="50"
          verifiedScore={verifiedScores.citations?.marks}
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
            onChange={(e) =>
              handleInputChange(
                "indianCopyrightRegistered",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of copyrights"
            proofValue={formData.indianCopyrightRegistered.proof}
            onProofChange={(e) =>
              handleInputChange(
                "indianCopyrightRegistered",
                "proof",
                e.target.value
              )
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.indianCopyrightRegistered.verifiedScore
            }
          />
          <InputFieldWithProof
            label="Indian Copyright Granted (15 marks per copyright)"
            name="indianCopyrightGranted"
            value={formData.indianCopyrightGranted.count}
            onChange={(e) =>
              handleInputChange(
                "indianCopyrightGranted",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of copyrights"
            proofValue={formData.indianCopyrightGranted.proof}
            onProofChange={(e) =>
              handleInputChange(
                "indianCopyrightGranted",
                "proof",
                e.target.value
              )
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.indianCopyrightGranted.verifiedScore
            }
          />
        </div>
        <ScoreCard
          label="Copyright Individual Score"
          score={scores.copyrightIndividualScore}
          total="30"
          verifiedScore={verifiedScores.copyrightIndividual?.marks}
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
            onChange={(e) =>
              handleInputChange(
                "indianCopyrightRegisteredInstitute",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of copyrights"
            proofValue={formData.indianCopyrightRegisteredInstitute.proof}
            onProofChange={(e) =>
              handleInputChange(
                "indianCopyrightRegisteredInstitute",
                "proof",
                e.target.value
              )
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.indianCopyrightRegisteredInstitute.verifiedScore
            }
          />
          <InputFieldWithProof
            label="Indian Copyright Granted (30 marks per copyright)"
            name="indianCopyrightGrantedInstitute"
            value={formData.indianCopyrightGrantedInstitute.count}
            onChange={(e) =>
              handleInputChange(
                "indianCopyrightGrantedInstitute",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of copyrights"
            proofValue={formData.indianCopyrightGrantedInstitute.proof}
            onProofChange={(e) =>
              handleInputChange(
                "indianCopyrightGrantedInstitute",
                "proof",
                e.target.value
              )
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.indianCopyrightGrantedInstitute.verifiedScore
            }
          />
        </div>
        <ScoreCard
          label="Copyright Institute Score"
          score={scores.copyrightInstituteScore}
          total="No limit"
          verifiedScore={verifiedScores.copyrightInstitute?.marks}
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
            onChange={(e) =>
              handleInputChange(
                "indianPatentRegistered",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of patents"
            proofValue={formData.indianPatentRegistered.proof}
            onProofChange={(e) =>
              handleInputChange(
                "indianPatentRegistered",
                "proof",
                e.target.value
              )
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.indianPatentRegistered.verifiedScore
            }
          />
          <InputFieldWithProof
            label="Indian Patent Published (30 marks per patent)"
            name="indianPatentPublished"
            value={formData.indianPatentPublished.count}
            onChange={(e) =>
              handleInputChange(
                "indianPatentPublished",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of patents"
            proofValue={formData.indianPatentPublished.proof}
            onProofChange={(e) =>
              handleInputChange(
                "indianPatentPublished",
                "proof",
                e.target.value
              )
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.indianPatentPublished.verifiedScore
            }
          />
          <InputFieldWithProof
            label="Indian Patent Granted (50 marks per patent)"
            name="indianPatentGranted"
            value={formData.indianPatentGranted.count}
            onChange={(e) =>
              handleInputChange(
                "indianPatentGranted",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of patents"
            proofValue={formData.indianPatentGranted.proof}
            onProofChange={(e) =>
              handleInputChange("indianPatentGranted", "proof", e.target.value)
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.indianPatentGranted.verifiedScore
            }
          />
          <InputFieldWithProof
            label="Indian Patent Commercialized (100 marks per patent)"
            name="indianPatentCommercialized"
            value={formData.indianPatentCommercialized.count}
            onChange={(e) =>
              handleInputChange(
                "indianPatentCommercialized",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of patents"
            proofValue={formData.indianPatentCommercialized.proof}
            onProofChange={(e) =>
              handleInputChange(
                "indianPatentCommercialized",
                "proof",
                e.target.value
              )
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.indianPatentCommercialized.verifiedScore
            }
          />
        </div>
        <ScoreCard
          label="Patent Individual Score"
          score={scores.patentIndividualScore}
          total="100"
          verifiedScore={verifiedScores.patentIndividual?.marks}
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
            onChange={(e) =>
              handleInputChange(
                "indianPatentRegisteredInstitute",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of patents"
            proofValue={formData.indianPatentRegisteredInstitute.proof}
            onProofChange={(e) =>
              handleInputChange(
                "indianPatentRegisteredInstitute",
                "proof",
                e.target.value
              )
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.indianPatentRegisteredInstitute.verifiedScore
            }
          />
          <InputFieldWithProof
            label="Indian Patent Published (60 marks per patent)"
            name="indianPatentPublishedInstitute"
            value={formData.indianPatentPublishedInstitute.count}
            onChange={(e) =>
              handleInputChange(
                "indianPatentPublishedInstitute",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of patents"
            proofValue={formData.indianPatentPublishedInstitute.proof}
            onProofChange={(e) =>
              handleInputChange(
                "indianPatentPublishedInstitute",
                "proof",
                e.target.value
              )
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.indianPatentPublishedInstitute.verifiedScore
            }
          />
          <InputFieldWithProof
            label="Indian Patent Granted (100 marks per patent)"
            name="indianPatentGrantedInstitute"
            value={formData.indianPatentGrantedInstitute.count}
            onChange={(e) =>
              handleInputChange(
                "indianPatentGrantedInstitute",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of patents"
            proofValue={formData.indianPatentGrantedInstitute.proof}
            onProofChange={(e) =>
              handleInputChange(
                "indianPatentGrantedInstitute",
                "proof",
                e.target.value
              )
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.indianPatentGrantedInstitute.verifiedScore
            }
          />
          <InputFieldWithProof
            label="Indian Patent Commercialized (200 marks per patent)"
            name="indianPatentCommercializedInstitute"
            value={formData.indianPatentCommercializedInstitute.count}
            onChange={(e) =>
              handleInputChange(
                "indianPatentCommercializedInstitute",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of patents"
            proofValue={formData.indianPatentCommercializedInstitute.proof}
            onProofChange={(e) =>
              handleInputChange(
                "indianPatentCommercializedInstitute",
                "proof",
                e.target.value
              )
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.indianPatentCommercializedInstitute.verifiedScore
            }
          />
        </div>
        <ScoreCard
          label="Patent Institute Score"
          score={scores.patentInstituteScore}
          total="No limit"
          verifiedScore={verifiedScores.patentInstitute?.marks}
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
            type="number"
            value={formData.researchGrants.amount}
            onChange={(e) =>
              handleInputChange(
                "researchGrants",
                "amount",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Amount in Rupees"
            proofValue={formData.researchGrants.proof}
            onProofChange={(e) =>
              handleInputChange("researchGrants", "proof", e.target.value)
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.researchGrants.verifiedScore
            }
          />
        </div>
        <ScoreCard
          label="Research Grants Score"
          score={scores.researchGrantsScore}
          total="No limit"
          verifiedScore={verifiedScores.researchGrants?.marks}
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
            type="number"
            value={formData.trainingProgramsRevenue.amount}
            onChange={(e) =>
              handleInputChange(
                "trainingProgramsRevenue",
                "amount",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Amount in Rupees"
            proofValue={formData.trainingProgramsRevenue.proof}
            onProofChange={(e) =>
              handleInputChange(
                "trainingProgramsRevenue",
                "proof",
                e.target.value
              )
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.trainingProgramsRevenue.verifiedScore
            }
          />
        </div>
        <ScoreCard
          label="Training Programs Revenue Score"
          score={scores.trainingRevenueScore}
          total="40"
          verifiedScore={verifiedScores.trainingPrograms?.marks}
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
            type="number"
            value={formData.nonResearchGrants.amount}
            onChange={(e) =>
              handleInputChange(
                "nonResearchGrants",
                "amount",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Amount in Rupees"
            proofValue={formData.nonResearchGrants.proof}
            onProofChange={(e) =>
              handleInputChange("nonResearchGrants", "proof", e.target.value)
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.nonResearchGrants.verifiedScore
            }
          />
        </div>
        <ScoreCard
          label="Non-Research Grants Score"
          score={scores.nonResearchGrantsScore}
          total="40"
          verifiedScore={verifiedScores.nonResearchGrants?.marks}
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
            onChange={(e) =>
              handleInputChange(
                "commercializedProducts",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of products"
            proofValue={formData.commercializedProducts.proof}
            onProofChange={(e) =>
              handleInputChange(
                "commercializedProducts",
                "proof",
                e.target.value
              )
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.commercializedProducts.verifiedScore
            }
          />
          <InputFieldWithProof
            label="Developed Products (40 marks per product)"
            name="developedProducts"
            value={formData.developedProducts.count}
            onChange={(e) =>
              handleInputChange(
                "developedProducts",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of products"
            proofValue={formData.developedProducts.proof}
            onProofChange={(e) =>
              handleInputChange("developedProducts", "proof", e.target.value)
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.developedProducts.verifiedScore
            }
          />
          <InputFieldWithProof
            label="Proof of Concepts (10 marks per POC)"
            name="proofOfConcepts"
            value={formData.proofOfConcepts.count}
            onChange={(e) =>
              handleInputChange(
                "proofOfConcepts",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of POCs"
            proofValue={formData.proofOfConcepts.proof}
            onProofChange={(e) =>
              handleInputChange("proofOfConcepts", "proof", e.target.value)
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.proofOfConcepts.verifiedScore
            }
          />
        </div>
        <ScoreCard
          label="Product Development Score"
          score={scores.productDevelopedScore}
          total="100"
          verifiedScore={verifiedScores.productDevelopment?.marks}
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
            onChange={(e) =>
              handleInputChange(
                "startupRevenueFiftyK",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of startups"
            proofValue={formData.startupRevenueFiftyK.proof}
            onProofChange={(e) =>
              handleInputChange("startupRevenueFiftyK", "proof", e.target.value)
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.startupRevenueFiftyK.verifiedScore
            }
          />
          <InputFieldWithProof
            label="Startup with Funds > 5 Lakhs (100 marks per startup)"
            name="startupFundsFiveLakhs"
            value={formData.startupFundsFiveLakhs.count}
            onChange={(e) =>
              handleInputChange(
                "startupFundsFiveLakhs",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of startups"
            proofValue={formData.startupFundsFiveLakhs.proof}
            onProofChange={(e) =>
              handleInputChange(
                "startupFundsFiveLakhs",
                "proof",
                e.target.value
              )
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.startupFundsFiveLakhs.verifiedScore
            }
          />
          <InputFieldWithProof
            label="Startup Products (40 marks per product)"
            name="startupProducts"
            value={formData.startupProducts.count}
            onChange={(e) =>
              handleInputChange(
                "startupProducts",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of products"
            proofValue={formData.startupProducts.proof}
            onProofChange={(e) =>
              handleInputChange("startupProducts", "proof", e.target.value)
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.startupProducts.verifiedScore
            }
          />
          <InputFieldWithProof
            label="Startup POCs (10 marks per POC)"
            name="startupPOCs"
            value={formData.startupPOCs.count}
            onChange={(e) =>
              handleInputChange(
                "startupPOCs",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of POCs"
            proofValue={formData.startupPOCs.proof}
            onProofChange={(e) =>
              handleInputChange("startupPOCs", "proof", e.target.value)
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.startupPOCs.verifiedScore
            }
          />
          <InputFieldWithProof
            label="Registered Startups (5 marks per startup)"
            name="startupRegistered"
            value={formData.startupRegistered.count}
            onChange={(e) =>
              handleInputChange(
                "startupRegistered",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of startups"
            proofValue={formData.startupRegistered.proof}
            onProofChange={(e) =>
              handleInputChange("startupRegistered", "proof", e.target.value)
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.startupRegistered.verifiedScore
            }
          />
        </div>
        <ScoreCard
          label="Startup Score"
          score={scores.startupScore}
          total="No limit"
          verifiedScore={verifiedScores.startup?.marks}
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
            onChange={(e) =>
              handleInputChange(
                "internationalAwards",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of awards"
            proofValue={formData.internationalAwards.proof}
            onProofChange={(e) =>
              handleInputChange("internationalAwards", "proof", e.target.value)
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.internationalAwards.verifiedScore
            }
          />
          <InputFieldWithProof
            label="Government Awards (20 marks per award)"
            name="governmentAwards"
            value={formData.governmentAwards.count}
            onChange={(e) =>
              handleInputChange(
                "governmentAwards",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of awards"
            proofValue={formData.governmentAwards.proof}
            onProofChange={(e) =>
              handleInputChange("governmentAwards", "proof", e.target.value)
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.governmentAwards.verifiedScore
            }
          />
          <InputFieldWithProof
            label="National Awards (5 marks per award)"
            name="nationalAwards"
            value={formData.nationalAwards.count}
            onChange={(e) =>
              handleInputChange(
                "nationalAwards",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of awards"
            proofValue={formData.nationalAwards.proof}
            onProofChange={(e) =>
              handleInputChange("nationalAwards", "proof", e.target.value)
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.nationalAwards.verifiedScore
            }
          />
          <InputFieldWithProof
            label="International Fellowships (50 marks per fellowship)"
            name="internationalFellowships"
            value={formData.internationalFellowships.count}
            onChange={(e) =>
              handleInputChange(
                "internationalFellowships",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of fellowships"
            proofValue={formData.internationalFellowships.proof}
            onProofChange={(e) =>
              handleInputChange(
                "internationalFellowships",
                "proof",
                e.target.value
              )
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.internationalFellowships.verifiedScore
            }
          />
          <InputFieldWithProof
            label="National Fellowships (30 marks per fellowship)"
            name="nationalFellowships"
            value={formData.nationalFellowships.count}
            onChange={(e) =>
              handleInputChange(
                "nationalFellowships",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of fellowships"
            proofValue={formData.nationalFellowships.proof}
            onProofChange={(e) =>
              handleInputChange("nationalFellowships", "proof", e.target.value)
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.nationalFellowships.verifiedScore
            }
          />
        </div>
        <ScoreCard
          label="Awards & Fellowships Score"
          score={scores.awardFellowshipScore}
          total="50"
          verifiedScore={verifiedScores.awardsAndFellowships?.marks}
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
            onChange={(e) =>
              handleInputChange(
                "activeMoUs",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of MoUs"
            proofValue={formData.activeMoUs.proof}
            onProofChange={(e) =>
              handleInputChange("activeMoUs", "proof", e.target.value)
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.activeMoUs.verifiedScore
            }
          />
          <InputFieldWithProof
            label="Industry Collaboration (20 marks per collaboration)"
            name="industryCollaboration"
            value={formData.industryCollaboration.count}
            onChange={(e) =>
              handleInputChange(
                "industryCollaboration",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of collaborations"
            proofValue={formData.industryCollaboration.proof}
            onProofChange={(e) =>
              handleInputChange(
                "industryCollaboration",
                "proof",
                e.target.value
              )
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.industryCollaboration.verifiedScore
            }
          />
        </div>
        <ScoreCard
          label="Industry/University Interaction Score"
          score={scores.interactionScore}
          total="No limit"
          verifiedScore={verifiedScores.industryInteraction?.marks}
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
            onChange={(e) =>
              handleInputChange(
                "internshipPlacementOffers",
                "count",
                parseInt(e.target.value) || 0
              )
            }
            placeholder="Number of offers"
            proofValue={formData.internshipPlacementOffers.proof}
            onProofChange={(e) =>
              handleInputChange(
                "internshipPlacementOffers",
                "proof",
                e.target.value
              )
            }
            verifiedScore={
              userData.status === "Verification Pending"
                ? "pending"
                : formData.internshipPlacementOffers.verifiedScore
            }
          />
        </div>
        <ScoreCard
          label="Internship/Placement Score"
          score={scores.internshipPlacementScore}
          total="No limit"
          verifiedScore={verifiedScores.internshipPlacement?.marks}
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
            <p className="text-sm text-blue-600 mt-1">
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
            "Submit Research Details"
          )}
        </button>
      </div>
    </div>
  );
};

export default Research;
