export interface VideoResource {
  id: string;
  title: string;
  channel: string;
  duration: string;
  youtubeId: string;
  topicTag: string;
  description: string;
  instructor?: string;
  institution?: string;
  timestamps?: Array<{ time: string; label: string }>;
}

export interface DocumentSection {
  title: string;
  content: string;
  formulaOrCode?: string;
}

export interface DocumentResource {
  id: string;
  title: string;
  type: 'Lecture Notes' | 'Formula Sheet' | 'Cheat Sheet' | 'Question Bank' | 'Lab Manual' | 'Handbook PDF';
  pages: number;
  fileSize: string;
  authorOrSource: string;
  description: string;
  downloadFilename: string;
  sections: DocumentSection[];
}

export interface DeepConcept {
  id: string;
  title: string;
  category: string;
  summary: string;
  inDepthAnalysis: string;
  realWorldApplication: string;
  keyTakeaway: string;
  visualDiagram?: string;
}

export interface BookContentEnrichment {
  topicId: string;
  bookTitle: string;
  videos: VideoResource[];
  documents: DocumentResource[];
  concepts: DeepConcept[];
}

// ── Master Catalog of Curated Videos, Documents & Concepts per Topic/Book ──
export const BOOK_MEDIA_CATALOG: Record<string, BookContentEnrichment> = {
  // ──────────────────────────────────────────
  // 1. MATHEMATICS: Eigenvalues & Linear Algebra (Grewal / Kreyszig)
  // ──────────────────────────────────────────
  'math-eigen': {
    topicId: 'math-eigen',
    bookTitle: 'Higher Engineering Mathematics • Dr. B.S. Grewal',
    videos: [
      {
        id: 'vid-math-1',
        title: 'Essence of Linear Algebra: Eigenvectors & Eigenvalues (Chapter 14)',
        channel: '3Blue1Brown',
        duration: '17:15',
        youtubeId: 'PFDu9oVAE-g',
        topicTag: 'GEOMETRIC INTUITION',
        instructor: 'Grant Sanderson',
        institution: '3Blue1Brown Mathematics',
        description: 'Visualizing eigenvalues and eigenvectors as axes of rotation and stretch that stay on their span under matrix transformation.',
        timestamps: [
          { time: '00:00', label: 'Geometric Transformation Overview' },
          { time: '04:20', label: 'What is an Eigenvector?' },
          { time: '09:15', label: 'Computing det(A - λI) = 0' },
          { time: '14:30', label: 'Diagonal Matrices & Basis Changes' }
        ]
      },
      {
        id: 'vid-math-2',
        title: 'Eigenvalues and Eigenvectors — Complete University & GATE Lecture',
        channel: 'Gate Smashers',
        duration: '22:40',
        youtubeId: '8hly31xKli0',
        topicTag: 'GATE & EXAM PREP',
        instructor: 'Varun Singla',
        institution: 'Gate Smashers Engineering',
        description: 'Step-by-step characteristic polynomial calculation, Cayley-Hamilton theorem, and short tricks for 3x3 matrices in GATE.',
        timestamps: [
          { time: '00:00', label: 'Definition & Characteristic Matrix' },
          { time: '05:30', label: 'Sum & Product of Eigenvalues Trick' },
          { time: '12:45', label: 'Eigenvectors for Distinct Eigenvalues' },
          { time: '18:10', label: 'Repeated Eigenvalues Case' }
        ]
      },
      {
        id: 'vid-math-3',
        title: 'MIT 18.06 Linear Algebra: Eigenvalues and Diagonalization',
        channel: 'MIT OpenCourseWare',
        duration: '47:50',
        youtubeId: 'k7RM-ot2NWY',
        topicTag: 'MIT MASTERCLASS',
        instructor: 'Prof. Gilbert Strang',
        institution: 'Massachusetts Institute of Technology',
        description: 'Rigorous derivation of matrix powers A^k, diagonalization A = SΛS⁻¹, and application to differential equation systems.',
        timestamps: [
          { time: '00:00', label: 'Introduction to Ax = λx' },
          { time: '15:20', label: 'Diagonalization Theorem' },
          { time: '30:10', label: 'Powers of A via Eigenvalues' },
          { time: '41:00', label: 'Differential Equations Du/dt = Au' }
        ]
      },
      {
        id: 'vid-math-4',
        title: 'NPTEL: Advanced Matrix Theory & Spectral Decomposition',
        channel: 'NPTEL-NOC IITM',
        duration: '41:15',
        youtubeId: 'j8Z0m5P1-10',
        topicTag: 'NPTEL ADVANCED',
        instructor: 'Prof. K.C. Sivakumar',
        institution: 'IIT Madras',
        description: 'In-depth treatment of Hermitian, Unitary, and Positive-Definite matrices, Rayleigh quotient, and Jordan Canonical Forms.',
        timestamps: [
          { time: '00:00', label: 'Spectral Mapping Theorem' },
          { time: '12:10', label: 'Hermitian and Symmetric Matrix Properties' },
          { time: '25:30', label: 'Singular Value Decomposition (SVD)' },
          { time: '36:40', label: 'Generalized Eigenvalue Problems' }
        ]
      },
      {
        id: 'vid-math-5',
        title: '15 GATE & ESE Solved Numericals on Eigenvalues and Diagonalization',
        channel: 'Made Easy Education',
        duration: '35:20',
        youtubeId: 'mC6kH1W_H_U',
        topicTag: 'NUMERICAL PROBLEM SET',
        instructor: 'Senior Faculty',
        institution: 'Made Easy Engineering Cell',
        description: 'High-speed shortcuts for solving non-homogeneous linear systems, Cayley-Hamilton inverse questions, and eigenvalue parity.',
        timestamps: [
          { time: '00:00', label: 'GATE 2024 Question Breakdown' },
          { time: '09:40', label: 'Orthogonal Matrix Eigenvalue Property' },
          { time: '18:50', label: 'Trace & Determinant Shortcut Proof' },
          { time: '28:30', label: 'Minimal Polynomial Calculation' }
        ]
      }
    ],
    documents: [
      {
        id: 'doc-math-1',
        title: 'Comprehensive Linear Algebra & Matrix Decomposition Notes',
        type: 'Lecture Notes',
        pages: 34,
        fileSize: '4.2 MB',
        authorOrSource: 'Prof. B.S. Grewal Editorial Team • Khanna Publishers',
        downloadFilename: 'Linear_Algebra_Eigenvalues_Notes.pdf',
        description: 'Authoritative class notes covering rank, linear independence, Cayley-Hamilton theorem, quadratic forms, and orthogonal reduction.',
        sections: [
          {
            title: '1. Characteristic Equation & Invariants',
            content: 'For any square matrix A of order n, the scalar λ satisfying the vector equation Ax = λx (x ≠ 0) is termed an eigenvalue. The characteristic equation det(A - λI) = 0 is a polynomial of degree n in λ.',
            formulaOrCode: '|A - λI| = λⁿ - S₁λⁿ⁻¹ + S₂λⁿ⁻² - ... + (-1)ⁿ det(A) = 0\nS₁ = Trace(A), S₂ = Sum of minors of principal diagonal, Sₙ = det(A)'
          },
          {
            title: '2. Cayley-Hamilton Theorem & Matrix Inverse',
            content: 'Every square matrix satisfies its own characteristic equation: P(A) = O. This gives an elegant algorithm to calculate matrix inverse A⁻¹ and high integer powers Aⁿ without direct matrix multiplications.',
            formulaOrCode: 'Aⁿ - S₁Aⁿ⁻¹ + ... + (-1)ⁿ det(A)·I = 0\nA⁻¹ = (-1)ⁿ⁻¹ / det(A) · [Aⁿ⁻¹ - S₁Aⁿ⁻² + ...]'
          },
          {
            title: '3. Diagonalization & Spectral Theorem',
            content: 'A real symmetric matrix A has strictly real eigenvalues and an orthonormal set of eigenvectors. Thus A is orthogonally diagonalizable: PᵀAP = D, where P is the modal matrix.',
            formulaOrCode: 'P = [X₁  X₂  ...  Xₙ],  D = diag(λ₁, λ₂, ..., λₙ)'
          }
        ]
      },
      {
        id: 'doc-math-2',
        title: 'Eigenvalues & Diagonalization Quick Formula Reference Card',
        type: 'Formula Sheet',
        pages: 6,
        fileSize: '850 KB',
        authorOrSource: 'Dhanya Academic Engineering Cell',
        downloadFilename: 'Eigenvalues_Quick_Formula_Sheet.pdf',
        description: 'Handy high-yield formula reference sheet for rapid exam revision before university and competitive entrance tests.',
        sections: [
          {
            title: 'Key Algebraic Invariants',
            content: '• Trace(A) = ∑ λᵢ (Sum of eigenvalues equals sum of main diagonal elements)\n• det(A) = ∏ λᵢ (Product of eigenvalues equals determinant of A)\n• Eigenvalues of Aᵀ are identical to eigenvalues of A\n• If λ is an eigenvalue of A, then λᵏ is an eigenvalue of Aᵏ and 1/λ is an eigenvalue of A⁻¹\n• Eigenvalues of a triangular matrix are simply its principal diagonal elements',
            formulaOrCode: 'Trace(A) = λ₁ + λ₂ + ... + λₙ\ndet(A) = λ₁ · λ₂ · ... · λₙ\nλ(A⁻¹) = 1 / λ(A)'
          }
        ]
      },
      {
        id: 'doc-math-3',
        title: 'GATE & University 10-Year Solved PYQ Handbook',
        type: 'Question Bank',
        pages: 48,
        fileSize: '5.8 MB',
        authorOrSource: 'IIT Kharagpur / GATE Organizing Committee',
        downloadFilename: 'Linear_Algebra_GATE_PYQ_Handbook.pdf',
        description: 'Complete step-by-step solved questions from 2015 to 2026 across CS, ME, ECE, and EE streams.',
        sections: [
          {
            title: 'Solved Problem: 3x3 Matrix Invariants',
            content: 'Given A is a 3x3 real matrix with eigenvalues 1, -1, 0. Find the determinant and trace of matrix B = A⁴ + 3A - 2I.\nSolution: By spectral mapping, eigenvalues of B are μᵢ = λᵢ⁴ + 3λᵢ - 2.\nFor λ = 1: μ₁ = 1 + 3 - 2 = 2\nFor λ = -1: μ₂ = 1 - 3 - 2 = -4\nFor λ = 0: μ₃ = 0 + 0 - 2 = -2\nTherefore, det(B) = (2)(-4)(-2) = 16, and Trace(B) = 2 - 4 - 2 = -4.',
            formulaOrCode: 'B = A⁴ + 3A - 2I => μ = λ⁴ + 3λ - 2\ndet(B) = 16,  Trace(B) = -4'
          },
          {
            title: 'Solved Problem: Cayley-Hamilton Characteristic Equation',
            content: 'Find matrix A⁴ if A = [[2, 1], [0, 2]].\nSolution: Characteristic equation: |A - λI| = (2 - λ)² = λ² - 4λ + 4 = 0.\nBy Cayley-Hamilton: A² = 4A - 4I.\nA³ = 4A² - 4A = 4(4A - 4I) - 4A = 12A - 16I.\nA⁴ = 12A² - 16A = 12(4A - 4I) - 16A = 32A - 48I = [[16, 32], [0, 16]].',
            formulaOrCode: 'A⁴ = 32A - 48I = [[16, 32], [0, 16]]'
          }
        ]
      },
      {
        id: 'doc-math-4',
        title: 'Numerical Methods & MATLAB Linear Algebra Laboratory Manual',
        type: 'Lab Manual',
        pages: 20,
        fileSize: '2.6 MB',
        authorOrSource: 'Computational Mathematics Department',
        downloadFilename: 'MATLAB_Linear_Algebra_Lab_Manual.pdf',
        description: 'Power method implementation for dominant eigenvalue extraction, QR algorithm, and SVD in MATLAB and Python NumPy.',
        sections: [
          {
            title: 'Power Iteration Method Algorithm',
            content: 'The Power Method computes the dominant eigenvalue and its corresponding eigenvector by iterative matrix-vector multiplications: x_{k+1} = (A · x_k) / ||A · x_k||.',
            formulaOrCode: 'def power_iteration(A, num_iter=100):\n    x = np.random.rand(A.shape[1])\n    for _ in range(num_iter):\n        x = np.dot(A, x) / np.linalg.norm(np.dot(A, x))\n    eigenvalue = np.dot(x.T, np.dot(A, x)) / np.dot(x.T, x)\n    return eigenvalue, x'
          }
        ]
      },
      {
        id: 'doc-math-5',
        title: 'Kreyszig Advanced Engineering Mathematics: Chapter 8 Monograph',
        type: 'Handbook PDF',
        pages: 52,
        fileSize: '6.4 MB',
        authorOrSource: 'Erwin Kreyszig • John Wiley & Sons',
        downloadFilename: 'Kreyszig_Chapter8_Eigenvalues.pdf',
        description: 'Exhaustive textbook chapter reprint covering complex matrices, quadratic forms, Gershgorin circle theorem, and linear systems.',
        sections: [
          {
            title: 'Gershgorin Disc Theorem',
            content: 'Every eigenvalue of an n×n matrix A lies within at least one of the Gershgorin discs D(a_ii, R_i) in the complex plane, where R_i = ∑_{j≠i} |a_ij| is the sum of the absolute values of the off-diagonal entries in row i.',
            formulaOrCode: '|λ - a_ii| ≤ ∑_{j≠i} |a_ij|'
          }
        ]
      }
    ],
    concepts: [
      {
        id: 'concept-math-1',
        title: 'Spectral Theorem & Matrix Diagonalization in Data Science',
        category: 'THEORETICAL CORE',
        summary: 'Decomposing arbitrary linear operators into pure directional scalings.',
        inDepthAnalysis: 'Diagonalization A = P D P⁻¹ allows us to compute complex matrix functions such as e^(At), sin(At), and A¹⁰⁰⁰ in O(n) scalar operations instead of O(n³) repeated matrix multiplications. For symmetric matrices, eigenvectors are always mutually orthogonal, guaranteeing numerical stability in high-dimensional calculations.',
        realWorldApplication: 'Principal Component Analysis (PCA) in machine learning uses eigendecomposition of the data covariance matrix to find directions of maximum variance and compress feature spaces.',
        keyTakeaway: 'Eigenvectors define the natural coordinate system where the matrix acts as pure independent scaling factors along each axis.',
        visualDiagram: 'Matrix A  ──>  Rotates & Scales Space\nEigenvector x ──> Keeps direction: A·x = λ·x'
      },
      {
        id: 'concept-math-2',
        title: 'Google PageRank: The World’s Largest Eigenvector Computation',
        category: 'INDUSTRIAL CASE STUDY',
        summary: 'How Google organized the world wide web using the stationary distribution of Markov chains.',
        inDepthAnalysis: 'The internet is modeled as a massive transition probability matrix M where M_ij represents the probability of a surfer clicking a hyperlink from page j to page i. The steady-state importance vector r satisfies Mr = r (the eigenvector corresponding to eigenvalue λ = 1). Power iteration computes this dominant eigenvector across billions of web pages in minutes.',
        realWorldApplication: 'Powers modern search engine ranking, citation indexes, and graph social network influence modeling.',
        keyTakeaway: 'The Perron-Frobenius theorem guarantees that positive stochastic matrices have a unique dominant eigenvalue λ = 1 with a strictly positive eigenvector.',
        visualDiagram: 'Web Hyperlink Graph  ──>  Transition Matrix M  ──>  M·r = 1·r  ──>  PageRank'
      },
      {
        id: 'concept-math-3',
        title: 'Vibrational Modes & Mechanical Resonance in Civil Engineering',
        category: 'ENGINEERING APPLICATION',
        summary: 'Preventing bridge and skyscraper collapse by computing natural vibration frequencies.',
        inDepthAnalysis: 'The dynamic motion of a multi-degree-of-freedom mechanical structure is governed by M·x"(t) + K·x(t) = 0. Substituting harmonic motion x(t) = u·e^(iωt) yields the generalized eigenvalue problem: K·u = ω²·M·u. The eigenvalues λ = ω² represent the squared natural frequencies of vibration.',
        realWorldApplication: 'Tuned mass dampers in skyscrapers like Taipei 101 and the design of earthquake-resistant suspension bridges.',
        keyTakeaway: 'If external wind or earthquake excitation frequency matches an eigenvalue, resonance occurs leading to structural catastrophic failure.',
        visualDiagram: 'Mass Matrix M + Stiffness K  ──>  det(K - ω²M) = 0  ──>  Natural Frequencies ωᵢ'
      }
    ]
  },

  // ──────────────────────────────────────────
  // 2. SENSORS & INSTRUMENTATION: LVDT (Sawhney / Doebelin)
  // ──────────────────────────────────────────
  'eie-lvdt': {
    topicId: 'eie-lvdt',
    bookTitle: 'A Course in Measurements & Instrumentation • Dr. A.K. Sawhney',
    videos: [
      {
        id: 'vid-lvdt-1',
        title: 'LVDT Construction, Working Principle & Null Voltage Explanation',
        channel: 'NPTEL-NOC IITM',
        duration: '31:20',
        youtubeId: 'v4CD6eyPOwQ',
        topicTag: 'NPTEL MASTERCLASS',
        instructor: 'Prof. G.K. Ananthasuresh',
        institution: 'Indian Institute of Technology Madras',
        description: 'Complete physics of Linear Variable Differential Transformers, differential coupling, null voltage causes, and phase sensitivity.',
        timestamps: [
          { time: '00:00', label: 'Inductive Transducers Overview' },
          { time: '07:15', label: 'Symmetrical Secondary Coils' },
          { time: '14:40', label: 'Differential Output Equation' },
          { time: '24:00', label: 'Residual Null Voltage Eliminating Methods' }
        ]
      },
      {
        id: 'vid-lvdt-2',
        title: 'Linear Variable Differential Transformer (LVDT) Made Easy',
        channel: 'Gate Smashers',
        duration: '18:15',
        youtubeId: 'q5uM4VKy930',
        topicTag: 'GATE INSTRUMENTATION',
        instructor: 'Varun Singla',
        institution: 'Gate Smashers',
        description: 'Exam-focused breakdown of core displacement, calibration curve, sensitivity formula, and phase-sensitive demodulators.',
        timestamps: [
          { time: '00:00', label: 'What is LVDT & Secondary Connection' },
          { time: '05:40', label: 'Characteristic Curve (Displacement vs V_out)' },
          { time: '11:20', label: 'Sensitivity Definition S = ΔV / Δx' },
          { time: '15:30', label: 'GATE Previous Questions' }
        ]
      },
      {
        id: 'vid-lvdt-3',
        title: 'Industrial LVDT Signal Conditioning Circuits & AD598 IC Interface',
        channel: 'Analog Devices Official',
        duration: '26:50',
        youtubeId: 'p2v1X1z7o3k',
        topicTag: 'SIGNAL CONDITIONING',
        instructor: 'Applications Engineering Team',
        institution: 'Analog Devices Instrumentation Lab',
        description: 'Complete hardware schematic for driving LVDTs with sine oscillators and demodulating differential outputs using AD598 / AD698 monolithic chips.',
        timestamps: [
          { time: '00:00', label: 'Primary Oscillator Design' },
          { time: '08:20', label: 'Synchronous Rectifier Architecture' },
          { time: '16:40', label: 'Temperature Drift Compensation' },
          { time: '22:15', label: 'Analog-to-Digital Interfacing' }
        ]
      },
      {
        id: 'vid-lvdt-4',
        title: 'LVDT Calibration & Sensitivity Experiment Hands-On Demonstration',
        channel: 'Engineering Made Easy',
        duration: '21:35',
        youtubeId: 'k1Z8_4X8o1E',
        topicTag: 'PRACTICAL LAB DEMO',
        instructor: 'Dr. S. Mukherjee',
        institution: 'Sensors Laboratory',
        description: 'Live physical lab setup using a micrometer head, carrier amplifier, and dual-channel oscilloscope to measure linearity and sensitivity.',
        timestamps: [
          { time: '00:00', label: 'Physical Transducer Inspection' },
          { time: '05:45', label: 'Connecting in Series Opposition' },
          { time: '12:10', label: 'Measuring V_out with Micrometer Shifts' },
          { time: '18:00', label: 'Plotting the Linear Operating Region' }
        ]
      },
      {
        id: 'vid-lvdt-5',
        title: 'GATE Instrumentation 10-Year Solved Questions on LVDT & Inductive Pickups',
        channel: 'GATE Academy',
        duration: '38:40',
        youtubeId: 'w2N9_1R0u2U',
        topicTag: 'SOLVED PYQ SET',
        instructor: 'Umesh Dhande',
        institution: 'GATE Academy',
        description: 'Solving complex sensitivity, phase error, and bridge imbalance numerical questions asked in GATE IN from 2012 to 2025.',
        timestamps: [
          { time: '00:00', label: 'GATE 2023 2-Mark Problem' },
          { time: '11:15', label: 'Residual Null Voltage Vector Analysis' },
          { time: '22:30', label: 'Sensitivity Shift with Temperature' },
          { time: '32:10', label: 'Frequency Response & Bandwidth' }
        ]
      }
    ],
    documents: [
      {
        id: 'doc-lvdt-1',
        title: 'LVDT Theory, Signal Conditioning & Calibration Manual',
        type: 'Lecture Notes',
        pages: 32,
        fileSize: '3.8 MB',
        authorOrSource: 'Dr. A.K. Sawhney & Puneet Sawhney • Dhanpat Rai & Co.',
        downloadFilename: 'LVDT_Theory_and_Calibration_Notes.pdf',
        description: 'Comprehensive monograph on passive inductive transducers, phase sensitive detectors, and harmonic filtering.',
        sections: [
          {
            title: '1. Working Principle & Electromagnetic Induction',
            content: 'The primary coil is excited by an AC supply (1 kHz to 10 kHz, 1V to 10V RMS). Two identical secondary coils are connected in series opposition. When the core is centered, induced voltages E_s1 = E_s2, resulting in zero differential output.',
            formulaOrCode: 'E_out = E_s1 - E_s2 = k · x · sin(ωt ± φ)\nAt null (x = 0): E_out ≈ E_residual (due to harmonics & stray capacitance)'
          },
          {
            title: '2. Phase Sensitive Demodulation',
            content: 'Because E_out reverses phase by 180° when the core moves past null, standard AC voltmeters cannot detect displacement direction. A Phase Sensitive Demodulator (PSD) references the primary excitation to generate a signed DC voltage.',
            formulaOrCode: 'V_dc = +k·|x|  (for +x displacement)\nV_dc = -k·|x|  (for -x displacement)'
          }
        ]
      },
      {
        id: 'doc-lvdt-2',
        title: 'LVDT Laboratory Experiment Guide & Calibration Sheet',
        type: 'Lab Manual',
        pages: 16,
        fileSize: '2.1 MB',
        authorOrSource: 'Department of Instrumentation Engineering',
        downloadFilename: 'LVDT_Laboratory_Practical_Manual.pdf',
        description: 'Wiring schematics, micrometer calibration procedures, error calculations, and sensitivity determinations.',
        sections: [
          {
            title: 'Lab Procedure: Sensitivity Calculation',
            content: 'Mount the LVDT core onto a precision micrometer stage. Step displacement in 0.5 mm increments from -5.0 mm to +5.0 mm. Measure AC differential voltage and demodulated DC output. Plot V_out vs displacement and determine slope in mV/mm.',
            formulaOrCode: 'Sensitivity S = ΔV_out / Δx [mV / mm]\nLinearity Error = (Max Deviation / Full Scale Output) × 100%'
          }
        ]
      },
      {
        id: 'doc-lvdt-3',
        title: 'LVDT Transducers & Inductive Pickups Formula Cheat Sheet',
        type: 'Formula Sheet',
        pages: 6,
        fileSize: '790 KB',
        authorOrSource: 'Sensors & Transducers Academic Cell',
        downloadFilename: 'LVDT_Formula_Cheat_Sheet.pdf',
        description: 'Summary of sensitivity equations, carrier excitation requirements, core permeability relations, and bridge balancing.',
        sections: [
          {
            title: 'Core Formulas & Mathematical Constants',
            content: '• Differential Output: V_out = V_s1 - V_s2\n• Sensitivity: S = (V_out) / (V_in · x) [mV / V / mm]\n• Residual Null Voltage: V_null = √(V_fundamental_quadrature² + V_harmonics²)\n• Primary Inductance: L_p = (μ₀ · μ_r · N_p² · A) / l',
            formulaOrCode: 'S = ΔV / Δx\nV_null ≤ 0.5% of Full Scale'
          }
        ]
      },
      {
        id: 'doc-lvdt-4',
        title: 'GATE & University Solved Question Bank: Inductive Sensors',
        type: 'Question Bank',
        pages: 38,
        fileSize: '4.5 MB',
        authorOrSource: 'National Examination Board in Instrumentation',
        downloadFilename: 'Inductive_Transducers_PYQ_Handbook.pdf',
        description: '45+ solved examination problems with complete phasor diagrams, calibration calculations, and sensitivity plots.',
        sections: [
          {
            title: 'Solved Problem: LVDT Sensitivity with Voltmeter Loading',
            content: 'An LVDT has a secondary voltage of 5V for a displacement of 12.5 mm. The output is connected to a 10 kΩ load. Find the sensitivity and the output voltage for a displacement of 8.0 mm.\nSolution: Sensitivity S = 5V / 12.5 mm = 0.4 V/mm = 400 mV/mm.\nFor x = 8.0 mm: V_out = S · x = 0.4 V/mm · 8.0 mm = 3.20 V.',
            formulaOrCode: 'S = 400 mV/mm,  V_out(8mm) = 3.20 V'
          }
        ]
      },
      {
        id: 'doc-lvdt-5',
        title: 'Doebelin Measurement Systems: Inductive Transducers Chapter',
        type: 'Handbook PDF',
        pages: 44,
        fileSize: '5.2 MB',
        authorOrSource: 'Ernest O. Doebelin • McGraw Hill',
        downloadFilename: 'Doebelin_Inductive_Sensors_Chapter.pdf',
        description: 'Complete theoretical monograph on variable reluctance, eddy current probes, resolver systems, and rotary RVDT units.',
        sections: [
          {
            title: 'Dynamic Response and Bandwidth Limits',
            content: 'The upper frequency limit of an LVDT is determined by the excitation carrier frequency. The mechanical frequency of displacement must not exceed 1/10th of the carrier excitation frequency to prevent aliasing and phase distortion.',
            formulaOrCode: 'f_max_mechanical ≤ 0.1 · f_carrier'
          }
        ]
      }
    ],
    concepts: [
      {
        id: 'concept-lvdt-1',
        title: 'Zero-Friction Electromagnetic Coupling & Infinite Resolution',
        category: 'TRANSDUCER ADVANTAGE',
        summary: 'Why LVDT remains unmatched in aerospace and precision turbine valves.',
        inDepthAnalysis: 'Because there is no physical mechanical contact between the movable high-permeability ferromagnetic nickel-iron core and the transformer coil assembly, there is zero wear, zero hysteresis, and infinite theoretical resolution. Resolution is limited purely by external signal conditioning electronics and noise floor.',
        realWorldApplication: 'Fly-by-wire hydraulic actuator feedback in Boeing and Airbus commercial airliners, and steam turbine governor valve control.',
        keyTakeaway: 'The non-contact differential transformer design grants an MTBF (Mean Time Between Failures) exceeding 100,000 hours in harsh industrial vibration environments.',
        visualDiagram: 'Primary AC Excitation  ──>  Magnetic Core  ──>  Secondary Coils (Opposed)  ──>  Zero Null'
      },
      {
        id: 'concept-lvdt-2',
        title: 'Residual Null Voltage: Elimination & 3rd Harmonic Filtering',
        category: 'ENGINEERING CHALLENGE',
        summary: 'Resolving the non-zero voltage that persists at the physical mechanical null.',
        inDepthAnalysis: 'At exact mechanical center, E_out should ideally be 0V. However, small non-zero voltages (residual null voltage) persist due to: (1) Harmonics in the excitation source, (2) Stray inter-winding capacitances, and (3) Magnetic asymmetries in the core. Phase-locked synchronous demodulation and active low-pass filtering effectively suppress this error.',
        realWorldApplication: 'Nanometer-scale lithography positioning stages in semiconductor fabrication equipment.',
        keyTakeaway: 'Residual null voltage must not exceed 0.5% of full-scale output for precision class instruments.',
        visualDiagram: 'Core at Center  ──>  Odd Harmonics + Stray C  ──>  Residual Null  ──>  Filtered by PSD'
      }
    ]
  },

  // ──────────────────────────────────────────
  // 3. COMPUTER SCIENCE: Binary Search Trees & AVL (CLRS / Lipschutz)
  // ──────────────────────────────────────────
  'dsa-bst': {
    topicId: 'dsa-bst',
    bookTitle: 'Introduction to Algorithms (CLRS) • Cormen, Leiserson, Rivest, Stein',
    videos: [
      {
        id: 'vid-bst-1',
        title: 'Binary Search Tree Complete Course: Search, Insert, Delete, Traversals',
        channel: 'Abdul Bari',
        duration: '45:10',
        youtubeId: 'pYT9F8_LFTM',
        topicTag: 'ALGORITHM MASTERCLASS',
        instructor: 'Abdul Bari',
        institution: 'Algorithms Academy',
        description: 'Renowned clear visual walkthrough of BST property, recursive insertion, deletion of nodes with 2 children (inorder successor), and tree heights.',
        timestamps: [
          { time: '00:00', label: 'Binary Search Tree Fundamentals' },
          { time: '11:30', label: 'Recursive Insertion' },
          { time: '22:15', label: 'Searching an Element' },
          { time: '32:40', label: 'Deleting a Node (3 Cases)' }
        ]
      },
      {
        id: 'vid-bst-2',
        title: 'AVL Trees & Rotations (LL, RR, LR, RL) with Visual Examples',
        channel: 'Abdul Bari',
        duration: '38:25',
        youtubeId: 'jDM6_TnYIqE',
        topicTag: 'SELF-BALANCING TREES',
        instructor: 'Abdul Bari',
        institution: 'Algorithms Academy',
        description: 'How AVL trees maintain O(log n) worst-case search time using balance factors and single/double rotations.',
        timestamps: [
          { time: '00:00', label: 'Why AVL Trees? (Skewed Tree Problem)' },
          { time: '08:45', label: 'Balance Factor Calculation' },
          { time: '18:10', label: 'Single Rotations: LL and RR' },
          { time: '28:30', label: 'Double Rotations: LR and RL' }
        ]
      },
      {
        id: 'vid-bst-3',
        title: 'Red-Black Trees: Invariants, Insertions and Color Flips Explained',
        channel: 'freeCodeCamp.org',
        duration: '42:18',
        youtubeId: 'qvZGUFHWChY',
        topicTag: 'ADVANCED DATA STRUCTURES',
        instructor: 'Michael Sambol',
        institution: 'freeCodeCamp',
        description: 'Complete breakdown of Red-Black properties, black-height invariants, restructuring cases, and why the Linux kernel prefers Red-Black trees over AVL.',
        timestamps: [
          { time: '00:00', label: '5 Red-Black Invariants' },
          { time: '12:40', label: 'Case 1: Uncle is Red' },
          { time: '23:15', label: 'Case 2 & 3: Uncle is Black' },
          { time: '35:00', label: 'Amortized Complexity Comparison' }
        ]
      },
      {
        id: 'vid-bst-4',
        title: 'MIT 6.006 Introduction to Algorithms: Binary Search Trees & BST Sort',
        channel: 'MIT OpenCourseWare',
        duration: '50:30',
        youtubeId: '76dhtgZt38A',
        topicTag: 'MIT LECTURE',
        instructor: 'Prof. Erik Demaine',
        institution: 'MIT Department of EECS',
        description: 'Formal mathematical proof of expected O(log n) height for random insertions, augmented trees, and range query lookups.',
        timestamps: [
          { time: '00:00', label: 'Node Interface & BST Property' },
          { time: '14:20', label: 'Augmented BSTs for Subtree Sizes' },
          { time: '29:45', label: 'Predecessor and Successor Algorithms' },
          { time: '43:10', label: 'BST Sort in O(n log n)' }
        ]
      },
      {
        id: 'vid-bst-5',
        title: 'Top 15 LeetCode & FAANG Interview Problems on Trees',
        channel: 'NeetCode',
        duration: '36:12',
        youtubeId: 'L8ooRkfs5hQ',
        topicTag: 'INTERVIEW PREPARATION',
        instructor: 'NeetCode',
        institution: 'NeetCode IO',
        description: 'Lowest Common Ancestor (LCA), Validate Binary Search Tree, Invert Tree, and Construct Tree from Preorder & Inorder traversals.',
        timestamps: [
          { time: '00:00', label: 'Validate BST (Min/Max Boundaries)' },
          { time: '10:15', label: 'Lowest Common Ancestor in BST' },
          { time: '19:40', label: 'Kth Smallest Element in a BST' },
          { time: '28:50', label: 'Serialize and Deserialize Binary Tree' }
        ]
      }
    ],
    documents: [
      {
        id: 'doc-bst-1',
        title: 'CLRS Chapter 12 & 13: Binary Search Trees & Red-Black Trees Handbook',
        type: 'Handbook PDF',
        pages: 42,
        fileSize: '5.1 MB',
        authorOrSource: 'The MIT Press • Cormen et al.',
        downloadFilename: 'CLRS_Binary_Search_Trees_Chapter.pdf',
        description: 'Formal algorithmic proofs, runtime recurrences, pseudo-code specifications, and competitive programming problem sets.',
        sections: [
          {
            title: '1. The Binary Search Tree Property',
            content: 'Let x be a node in a binary search tree. If y is a node in the left subtree of x, then y.key ≤ x.key. If y is a node in the right subtree of x, then y.key ≥ x.key. Inorder tree walk prints all keys in sorted order in O(n) time.',
            formulaOrCode: 'INORDER-TREE-WALK(x):\n  if x != NIL:\n    INORDER-TREE-WALK(x.left)\n    print(x.key)\n    INORDER-TREE-WALK(x.right)'
          },
          {
            title: '2. Deletion Algorithm (3 Cases)',
            content: 'Case 1: Node has no children -> simply remove it. Case 2: Node has 1 child -> splice child into parent. Case 3: Node has 2 children -> find inorder successor y (minimum in right subtree), replace node key with y.key, and delete y.',
            formulaOrCode: 'Time Complexity: Worst Case O(h), where h is tree height.\nFor balanced AVL/Red-Black: h = O(log n)'
          }
        ]
      },
      {
        id: 'doc-bst-2',
        title: 'Tree Rotations & Balancing Quick Cheat Sheet',
        type: 'Cheat Sheet',
        pages: 6,
        fileSize: '720 KB',
        authorOrSource: 'Dhanya Computer Science Society',
        downloadFilename: 'AVL_Tree_Rotations_Cheat_Sheet.pdf',
        description: 'Visual diagrams of Left-Left, Right-Right, Left-Right, and Right-Left rotations with C++ and Java snippets.',
        sections: [
          {
            title: 'AVL Balance Factor Rules',
            content: 'Balance Factor BF(N) = Height(N.left) - Height(N.right). An AVL node is unbalanced if |BF| > 1.\n• BF = +2 and Child BF = +1: Single Right Rotation (LL)\n• BF = -2 and Child BF = -1: Single Left Rotation (RR)\n• BF = +2 and Child BF = -1: Left-Right Rotation (LR)\n• BF = -2 and Child BF = +1: Right-Left Rotation (RL)',
            formulaOrCode: 'int getBalance(Node* N) {\n  return N == NULL ? 0 : height(N->left) - height(N->right);\n}'
          }
        ]
      },
      {
        id: 'doc-bst-3',
        title: 'GATE & FAANG Interview Solved Tree Problem Bank',
        type: 'Question Bank',
        pages: 50,
        fileSize: '6.2 MB',
        authorOrSource: 'Algorithms & Data Structures Faculty Group',
        downloadFilename: 'Tree_Algorithms_GATE_FAANG_Handbook.pdf',
        description: '60+ completely solved questions with recursion stack traces, time complexity derivations, and edge cases.',
        sections: [
          {
            title: 'Solved Problem: Maximum Number of Nodes in AVL Tree of Height h',
            content: 'Minimum nodes N(h) in an AVL tree of height h is given by the recurrence: N(h) = N(h-1) + N(h-2) + 1, with N(0) = 1 and N(1) = 2. Maximum nodes in a binary tree of height h is 2^(h+1) - 1.',
            formulaOrCode: 'N_min(h) = Fibonacci(h+2) - 1\nHeight bound: h < 1.4404 · log₂(n + 2) - 0.328'
          }
        ]
      },
      {
        id: 'doc-bst-4',
        title: 'C++ Modern STL & Linux Kernel Red-Black Tree Implementation',
        type: 'Lab Manual',
        pages: 24,
        fileSize: '2.8 MB',
        authorOrSource: 'Kernel Systems Engineering Cell',
        downloadFilename: 'Linux_Kernel_RB_Tree_Manual.pdf',
        description: 'Implementation guide on `struct rb_node` in the Linux kernel scheduler (CFS) and memory mapping.',
        sections: [
          {
            title: 'Linux Kernel rbtree API',
            content: 'Unlike C++ std::map, Linux rbtree is an intrusive data structure embedded directly into the payload struct to avoid extra pointer dereferencing and memory allocations.',
            formulaOrCode: 'struct my_struct {\n  struct rb_node node;\n  unsigned long key;\n};\n#define rb_entry(ptr, type, member) container_of(ptr, type, member)'
          }
        ]
      },
      {
        id: 'doc-bst-5',
        title: 'Complete Tree Traversal Lecture Notes & Morris Traversal (O(1) Space)',
        type: 'Lecture Notes',
        pages: 28,
        fileSize: '3.4 MB',
        authorOrSource: 'Schaum’s Outline Series • Seymour Lipschutz',
        downloadFilename: 'Tree_Traversals_and_Morris_Inorder.pdf',
        description: 'Inorder, Preorder, Postorder, Level-Order BFS, and Morris Traversal using threaded binary trees without stack or recursion.',
        sections: [
          {
            title: 'Morris Inorder Traversal Algorithm',
            content: 'Morris traversal establishes temporary threaded links from the rightmost node of the left subtree back to the current root, achieving O(n) time and O(1) auxiliary memory.',
            formulaOrCode: 'while (curr != NULL) {\n  if (curr->left == NULL) { print(curr->val); curr = curr->right; }\n  else { /* link predecessor */ }\n}'
          }
        ]
      }
    ],
    concepts: [
      {
        id: 'concept-bst-1',
        title: 'Degeneration into Linked List vs Logarithmic Balancing Guarantees',
        category: 'ALGORITHMIC INVARIANT',
        summary: 'Understanding why simple BSTs fail on sorted inputs and how self-balancing solves it.',
        inDepthAnalysis: 'If elements are inserted into a standard BST in already sorted order (e.g. [1, 2, 3, 4, 5]), the tree degenerates into a linear singly linked list of height h = n. Search, insert, and delete operations degrade from O(log n) to O(n). AVL trees and Red-Black trees enforce strict invariant constraints that guarantee height h ≤ 1.44 log₂(n), maintaining sub-millisecond lookups.',
        realWorldApplication: 'C++ `std::map` and `std::set`, Linux kernel memory address space tracking (vm_area_struct), and Java `TreeMap` utilize Red-Black trees.',
        keyTakeaway: 'Self-balancing trees amortize the rotation overhead to O(1) per insertion while protecting database indexes from catastrophic O(n) degradation.',
        visualDiagram: 'Sorted Insert [1,2,3,4] ──> Degenerate List O(n)\nAVL Rotations ──> Balanced Tree O(log n)'
      },
      {
        id: 'concept-bst-2',
        title: 'Database B-Trees & B+Trees: Extending BST to Disk Block Layouts',
        category: 'SYSTEMS ARCHITECTURE',
        summary: 'How relational databases scale BST concepts to terabytes of storage.',
        inDepthAnalysis: 'While in-memory BSTs store one key per node, disk access speeds are thousands of times slower than RAM. B-Trees generalize binary search trees to M-way search trees where each node holds an entire 4KB or 8KB disk page with hundreds of keys. This keeps tree depth to 3 or 4 levels even for millions of rows.',
        realWorldApplication: 'PostgreSQL, MySQL InnoDB indexes, SQLite, and Linux EXT4 filesystem directory indexing.',
        keyTakeaway: 'Matching node branching factor to operating system block size minimizes expensive disk I/O head seeks.',
        visualDiagram: 'Binary Search (2-way)  ──>  B-Tree (1000-way disk node)  ──>  Single Disk Seek'
      }
    ]
  },

  // ──────────────────────────────────────────
  // 4. PROGRAMMING IN C: Pointers & Memory Architecture (K&R)
  // ──────────────────────────────────────────
  'prog-pointers': {
    topicId: 'prog-pointers',
    bookTitle: 'The C Programming Language (ANSI C) • Brian Kernighan & Dennis Ritchie',
    videos: [
      {
        id: 'vid-c-1',
        title: 'Pointers in C / C++ [Full Course] — Memory Addresses, Dereferencing & Arrays',
        channel: 'freeCodeCamp.org',
        duration: '3:47:12',
        youtubeId: 'zuegQmMdy8M',
        topicTag: 'COMPREHENSIVE CRASH COURSE',
        instructor: 'Harshit Tyagi',
        institution: 'freeCodeCamp',
        description: 'The definitive complete course on memory architecture, pointers to pointers, array pointers, function pointers, and void pointers.',
        timestamps: [
          { time: '00:00:00', label: 'Introduction to Pointers & Virtual Memory' },
          { time: '00:32:15', label: 'Pointer Arithmetic & Types' },
          { time: '01:14:20', label: 'Pointers and Dynamic Memory (Heap vs Stack)' },
          { time: '02:05:40', label: 'Function Pointers & Callbacks' }
        ]
      },
      {
        id: 'vid-c-2',
        title: 'Pointer Arithmetic & Array Decay in C',
        channel: 'Neso Academy',
        duration: '16:45',
        youtubeId: 'qT_GZt4j_Y8',
        topicTag: 'MEMORY LAYOUT',
        instructor: 'Neso Academy',
        institution: 'Neso Academy Engineering',
        description: 'Deep dive into why `arr` decays into `&arr[0]`, pointer scaling based on `sizeof(T)`, and string buffer safety.',
        timestamps: [
          { time: '00:00', label: 'Address Arithmetic' },
          { time: '05:30', label: 'Array Name as Constant Pointer' },
          { time: '11:15', label: 'Pointer to Pointer (**ptr)' }
        ]
      },
      {
        id: 'vid-c-3',
        title: 'Function Pointers in C and Callback Architectures',
        channel: 'Jacob Sorber',
        duration: '14:20',
        youtubeId: 'ynYtgGUNelE',
        topicTag: 'SYSTEMS PROGRAMMING',
        instructor: 'Prof. Jacob Sorber',
        institution: 'Clemson University',
        description: 'How operating systems and event loops use function pointer arrays (jump tables) to implement polymorphism and drivers in pure C.',
        timestamps: [
          { time: '00:00', label: 'Syntax of Function Pointers' },
          { time: '05:10', label: 'Passing Functions as Arguments' },
          { time: '09:40', label: 'qsort Callback Implementation' }
        ]
      },
      {
        id: 'vid-c-4',
        title: 'Dynamic Memory Allocation: malloc, calloc, realloc & free',
        channel: 'Gate Smashers',
        duration: '24:10',
        youtubeId: 'D0q_4bS5-0w',
        topicTag: 'HEAP ALLOCATION',
        instructor: 'Varun Singla',
        institution: 'Gate Smashers',
        description: 'Heap fragmentation, memory leaks, null pointer dereferences, and double free errors with concrete GATE examples.',
        timestamps: [
          { time: '00:00', label: 'Stack vs Heap Memory' },
          { time: '07:30', label: 'malloc vs calloc Initialization' },
          { time: '15:20', label: 'realloc Memory Relocation' },
          { time: '20:10', label: 'free() & Dangling Pointers' }
        ]
      },
      {
        id: 'vid-c-5',
        title: 'C Memory Vulnerabilities: Buffer Overflow & Exploitation Defense',
        channel: 'Computerphile',
        duration: '18:50',
        youtubeId: '1S0aBV-Waeo',
        topicTag: 'CYBERSECURITY',
        instructor: 'Dr. Mike Pound',
        institution: 'University of Nottingham',
        description: 'Demonstrating how unsafe string copies smash the stack frame return address, and modern compiler canary defenses.',
        timestamps: [
          { time: '00:00', label: 'How the Call Stack Works' },
          { time: '06:15', label: 'Overwriting the Return Address' },
          { time: '12:40', label: 'Stack Canaries and ASLR' }
        ]
      }
    ],
    documents: [
      {
        id: 'doc-c-1',
        title: 'The C Programming Language: Chapter 5 Pointers and Arrays Reference',
        type: 'Lecture Notes',
        pages: 36,
        fileSize: '3.6 MB',
        authorOrSource: 'Dennis M. Ritchie & Brian W. Kernighan • Bell Laboratories',
        downloadFilename: 'Kernighan_Ritchie_Pointers_Chapter.pdf',
        description: 'Classic text on pointers, address arithmetic, character pointers and functions, multi-dimensional arrays, and command-line arguments.',
        sections: [
          {
            title: '1. Pointers and Addresses',
            content: 'A pointer is a variable that contains the address of a variable. The unary operator & gives the address of an object. The unary operator * is the indirection or dereferencing operator; when applied to a pointer, it accesses the object the pointer points to.',
            formulaOrCode: 'int x = 1, y = 2, z[10];\nint *ip;          /* ip is a pointer to int */\nip = &x;          /* ip now points to x */\ny = *ip;          /* y is now 1 */\n*ip = 0;          /* x is now 0 */'
          },
          {
            title: '2. Pointers and Function Arguments (Pass by Reference)',
            content: 'Since C passes arguments to functions by value, there is no direct way for the called function to alter a variable in the caller. To effect pass by reference, pass pointers to the values to be changed.',
            formulaOrCode: 'void swap(int *px, int *py) {\n  int temp = *px;\n  *px = *py;\n  *py = temp;\n}\n/* Called as: swap(&a, &b); */'
          }
        ]
      },
      {
        id: 'doc-c-2',
        title: 'C Memory Layout & Dynamic Allocation Cheat Sheet',
        type: 'Cheat Sheet',
        pages: 6,
        fileSize: '780 KB',
        authorOrSource: 'Dhanya Embedded & Systems Engineering Cell',
        downloadFilename: 'C_Memory_Layout_Cheat_Sheet.pdf',
        description: 'Visual diagrams of Text, Data, BSS, Heap, and Stack memory segments with Valgrind leak detection tips.',
        sections: [
          {
            title: 'The 5 Process Memory Segments',
            content: '1. Text Segment: Read-only compiled machine instructions.\n2. Initialized Data Segment (.data): Global & static variables initialized by programmer.\n3. Uninitialized Data (.bss): Global & static variables initialized to zero by kernel.\n4. Heap: Dynamically allocated memory via malloc()/calloc(), grows upwards.\n5. Stack: Local variables, stack frames, return addresses, grows downwards.',
            formulaOrCode: 'High Memory:  [ STACK (grows down) ]\n              [        ...         ]\n              [ HEAP  (grows up)   ]\n              [ BSS Segment        ]\n              [ Data Segment       ]\nLow Memory:   [ Text / Code        ]'
          }
        ]
      },
      {
        id: 'doc-c-3',
        title: 'GATE Computer Science 10-Year Solved Pointers & C Programming PYQs',
        type: 'Question Bank',
        pages: 44,
        fileSize: '5.2 MB',
        authorOrSource: 'GATE CS Committee',
        downloadFilename: 'C_Pointers_GATE_Solved_PYQ.pdf',
        description: 'Tricky pointer arithmetic, double dereference, string literal mutability, and array pointer vs pointer to array problems.',
        sections: [
          {
            title: 'Solved Problem: Pointer to Array vs Array of Pointers',
            content: 'Differentiate between `int *arr[10]` and `int (*arr)[10]`.\nSolution:\n1. `int *arr[10]`: Array of 10 pointers to integers. `[]` has higher precedence than `*`.\n2. `int (*arr)[10]`: Pointer to an array of 10 integers. `(*arr)` binds first.',
            formulaOrCode: 'int *arr[10];    // 10 pointers to int\nint (*arr)[10];  // 1 pointer to array of 10 ints'
          }
        ]
      },
      {
        id: 'doc-c-4',
        title: 'MISRA-C Industrial Embedded Coding Standards Handbook',
        type: 'Handbook PDF',
        pages: 48,
        fileSize: '5.9 MB',
        authorOrSource: 'Motor Industry Software Reliability Association',
        downloadFilename: 'MISRA_C_Safety_Critical_Standards.pdf',
        description: 'Rules for memory allocation, pointer casting, bounded loops, and MISRA-C compliance in automotive and medical software.',
        sections: [
          {
            title: 'Rule 11.4: Pointer Type Conversion Warnings',
            content: 'A conversion should not be performed between a pointer to object type and a different pointer to object type, as alignment requirements on target architectures can trigger hardware bus faults.',
            formulaOrCode: '// Non-compliant:\nuint32_t *p32 = (uint32_t*)p8; // Risk of unaligned memory fault'
          }
        ]
      },
      {
        id: 'doc-c-5',
        title: 'Low-Level Systems Lab: GDB Debugging & Valgrind Memory Profiling',
        type: 'Lab Manual',
        pages: 22,
        fileSize: '2.5 MB',
        authorOrSource: 'Systems Programming Lab Faculty',
        downloadFilename: 'GDB_Valgrind_Systems_Lab_Manual.pdf',
        description: 'Step-by-step commands for breakpoint inspection in GDB, memory leak detection with Valgrind Memcheck, and core dump analysis.',
        sections: [
          {
            title: 'Valgrind Leak Checking Command',
            content: 'Compile with debug symbols `-g` and run Valgrind to identify the exact line number of memory allocations that were never freed.',
            formulaOrCode: '$ gcc -g -Wall main.c -o main\n$ valgrind --leak-check=full --show-leak-kinds=all ./main'
          }
        ]
      }
    ],
    concepts: [
      {
        id: 'concept-c-1',
        title: 'Virtual Address Space, MMU & Pointer Arithmetic Invariants',
        category: 'SYSTEMS PROGRAMMING',
        summary: 'How operating systems map pointers to physical RAM and why pointer arithmetic scales.',
        inDepthAnalysis: 'A pointer in C does not hold a physical silicon RAM wire address; it holds a virtual address in the process address space mapped by the CPU Memory Management Unit (MMU) via page tables. When adding an integer `ptr + 1`, the compiler automatically increments the raw address by `sizeof(*ptr)` bytes (e.g. +4 for int, +8 for double).',
        realWorldApplication: 'Operating system kernels, device drivers, real-time embedded flight controllers, and memory allocators.',
        keyTakeaway: 'Pointer arithmetic is intrinsically typed: `ptr + i` evaluates to the physical byte address `(uintptr_t)ptr + (i * sizeof(*ptr))`.',
        visualDiagram: 'Pointer ptr (int*)  ──>  ptr + 1  ──>  Address increments by 4 Bytes'
      },
      {
        id: 'concept-c-2',
        title: 'Dangling Pointers, Buffer Overflows & Memory Leak Prevention',
        category: 'SOFTWARE SECURITY',
        summary: 'The root cause of 70% of historical computer security vulnerabilities and how to prevent them.',
        inDepthAnalysis: 'Freeing heap memory without resetting the pointer leaves a dangling pointer. If dereferenced later, it causes undefined behavior or Use-After-Free (UAF) exploits. Similarly, writing past array boundaries overwrites the caller stack frame return address, enabling arbitrary shellcode execution. Defenses include ASLR, stack canaries, and strict bounds checking with `snprintf` instead of `strcpy`.',
        realWorldApplication: 'Critical infrastructure security, Google Chrome sandbox, and the automotive ISO 26262 MISRA-C standard.',
        keyTakeaway: 'Always initialize pointers to `NULL`, verify `malloc` return values, free every allocated block exactly once, and zero freed pointers.',
        visualDiagram: 'malloc()  ──>  Use Memory  ──>  free(ptr)  ──>  ptr = NULL;'
      }
    ]
  },

  // ──────────────────────────────────────────
  // 5. CONTROL SYSTEMS: PID & Frequency Analysis (Ogata / Nagrath)
  // ──────────────────────────────────────────
  'control-pid': {
    topicId: 'control-pid',
    bookTitle: 'Modern Control Engineering • Katsuhiko Ogata',
    videos: [
      {
        id: 'vid-pid-1',
        title: 'Understanding PID Control: What is a PID Controller and How Does it Work?',
        channel: 'MATLAB',
        duration: '11:38',
        youtubeId: 'wkfEZmsQqiA',
        topicTag: 'MATLAB ENGINEERING',
        instructor: 'Brian Douglas',
        institution: 'MathWorks & MATLAB Control Systems',
        description: 'World-famous explanation of Proportional, Integral, and Derivative control using an intuitive quadcopter altitude and automotive cruise control example.',
        timestamps: [
          { time: '00:00', label: 'Why Feedback Control is Needed' },
          { time: '03:15', label: 'Proportional Gain Kp & Steady State Error' },
          { time: '06:20', label: 'Integral Action Ki & Eliminating Offset' },
          { time: '09:10', label: 'Derivative Action Kd & Damping Oscillation' }
        ]
      },
      {
        id: 'vid-pid-2',
        title: 'PID Controller Tuning Methods: Ziegler-Nichols & Frequency Domain',
        channel: 'NPTEL-NOC IIT Kharagpur',
        duration: '42:10',
        youtubeId: '4Y7zG48uHRo',
        topicTag: 'NPTEL ADVANCED',
        instructor: 'Prof. S. Sen',
        institution: 'IIT Kharagpur',
        description: 'Ziegler-Nichols open-loop reaction curve and closed-loop ultimate oscillation methods, phase margin tuning, and anti-windup circuits.',
        timestamps: [
          { time: '00:00', label: 'PID Standard Parallel Formulation' },
          { time: '14:20', label: 'Ziegler-Nichols Step Response Method' },
          { time: '28:10', label: 'Continuous Cycling Method (Ku & Tu)' },
          { time: '36:45', label: 'Integrator Windup & Saturation' }
        ]
      },
      {
        id: 'vid-pid-3',
        title: 'Bode Plots, Gain Margin & Phase Margin Stability Criteria',
        channel: 'Brian Douglas',
        duration: '18:40',
        youtubeId: 'ThoA4amCAX4',
        topicTag: 'FREQUENCY DOMAIN',
        instructor: 'Brian Douglas',
        institution: 'Control Systems Academy',
        description: 'How to calculate Gain Margin (GM) at Phase Crossover Frequency and Phase Margin (PM) at Gain Crossover Frequency.',
        timestamps: [
          { time: '00:00', label: 'Open-Loop vs Closed-Loop Stability' },
          { time: '06:30', label: 'Gain Crossover Frequency ω_gc' },
          { time: '12:15', label: 'Phase Crossover Frequency ω_pc' }
        ]
      },
      {
        id: 'vid-pid-4',
        title: 'Hardware Implementation of Analog Op-Amp PID Controllers',
        channel: 'All About Electronics',
        duration: '19:25',
        youtubeId: 'qQ2z8C-1t1Y',
        topicTag: 'HARDWARE CIRCUITRY',
        instructor: 'Dr. V. Rathore',
        institution: 'Electronics Lab',
        description: 'Constructing PID controllers using operational amplifiers, resistors, capacitors, and active summing amplifiers.',
        timestamps: [
          { time: '00:00', label: 'Proportional Amplifier with Gain R2/R1' },
          { time: '05:40', label: 'Miller Integrator Circuit' },
          { time: '11:20', label: 'Practical Differentiator with High-Frequency Rolloff' },
          { time: '16:00', label: 'Active Summing Node' }
        ]
      },
      {
        id: 'vid-pid-5',
        title: 'GATE Control Systems Solved 10-Year Numericals on PID & Stability',
        channel: 'Gate Smashers',
        duration: '31:45',
        youtubeId: 'k1Z8_4X8o1E',
        topicTag: 'EXAM PYQ DRILL',
        instructor: 'Varun Singla',
        institution: 'Gate Smashers',
        description: 'Routh-Hurwitz stability table for systems with PID controllers, steady-state error velocity constants, and peak overshoot.',
        timestamps: [
          { time: '00:00', label: 'GATE 2024 Question on Routh Array' },
          { time: '10:30', label: 'Finding Critical Gain K_marginal' },
          { time: '21:10', label: 'Steady State Error for Ramp Input' }
        ]
      }
    ],
    documents: [
      {
        id: 'doc-pid-1',
        title: 'Modern Control Engineering: Chapter 10 PID Control Systems',
        type: 'Lecture Notes',
        pages: 40,
        fileSize: '5.1 MB',
        authorOrSource: 'Prof. Katsuhiko Ogata • Prentice Hall',
        downloadFilename: 'Ogata_PID_Controllers_Chapter.pdf',
        description: 'Transfer function formulations, root locus effects, electronic operational amplifier implementations, and pneumatic industrial controllers.',
        sections: [
          {
            title: '1. Standard Parallel PID Equation',
            content: 'The controller output u(t) is the sum of three terms proportional to the error e(t), the integral of the error, and the derivative of the error.',
            formulaOrCode: 'u(t) = K_p · e(t) + K_i ∫₀ᵗ e(τ)dτ + K_d (de(t)/dt)\nIn s-domain: G_c(s) = K_p · [ 1 + 1/(T_i · s) + T_d · s ]'
          },
          {
            title: '2. Ziegler-Nichols Tuning Rules',
            content: 'In the closed-loop oscillation method, set T_i = ∞ and T_d = 0. Increase K_p until continuous sustained oscillation occurs at ultimate gain K_u with period T_u.',
            formulaOrCode: 'For Classic PID:\nK_p = 0.60 · K_u\nT_i = 0.50 · T_u  (K_i = K_p / T_i)\nT_d = 0.125 · T_u (K_d = K_p · T_d)'
          }
        ]
      },
      {
        id: 'doc-pid-2',
        title: 'Industrial PID Tuning & Anti-Windup Field Handbook',
        type: 'Handbook PDF',
        pages: 24,
        fileSize: '2.9 MB',
        authorOrSource: 'ISA (International Society of Automation)',
        downloadFilename: 'ISA_Industrial_PID_Tuning_Handbook.pdf',
        description: 'Practical commissioning techniques for chemical reactors, thermal heaters, motor drives, and actuator limiters.',
        sections: [
          {
            title: 'Integrator Windup & Clamping Solutions',
            content: 'When an actuator (e.g. control valve) hits 100% open or closed, the error cannot decrease immediately. An unregulated integral term accumulates a massive internal sum ("winds up"), leading to huge overshoots when returning to setpoint.',
            formulaOrCode: 'Anti-windup: Stop integrating whenever actuator output u(t) exceeds saturation limits [u_min, u_max].'
          }
        ]
      },
      {
        id: 'doc-pid-3',
        title: 'Control Systems Formulas & Stability Criteria Cheat Sheet',
        type: 'Formula Sheet',
        pages: 6,
        fileSize: '820 KB',
        authorOrSource: 'Dhanya Control & Automation Society',
        downloadFilename: 'Control_Systems_Formula_Cheat_Sheet.pdf',
        description: 'Formulas for damping ratio ζ, natural frequency ω_n, settling time, peak overshoot, and Bode phase margin.',
        sections: [
          {
            title: 'Second-Order System Step Response Formulas',
            content: '• Natural Frequency: ω_n = √(K)\n• Damping Ratio: ζ = B / (2√(M·K))\n• Percent Peak Overshoot: %MP = e^(-πζ / √(1-ζ²)) × 100%\n• Settling Time (2% criterion): t_s = 4 / (ζ · ω_n)\n• Peak Time: t_p = π / (ω_n · √(1-ζ²))',
            formulaOrCode: '%MP = e^(-πζ / √(1-ζ²)) · 100%\nt_s = 4 / (ζ · ω_n)'
          }
        ]
      },
      {
        id: 'doc-pid-4',
        title: 'GATE & University Control Systems 10-Year Solved Question Bank',
        type: 'Question Bank',
        pages: 46,
        fileSize: '5.5 MB',
        authorOrSource: 'Control Engineering Examination Board',
        downloadFilename: 'Control_Systems_GATE_PYQ_Handbook.pdf',
        description: 'Comprehensive solved questions covering root locus design, state-space representations, and Nyquist plots.',
        sections: [
          {
            title: 'Solved Problem: Gain Margin & Phase Margin from Transfer Function',
            content: 'Given open loop G(s)H(s) = 10 / (s(s+1)(s+2)). Find Phase Crossover Frequency and Gain Margin.\nSolution: Angle equation: -90° - arctan(ω) - arctan(ω/2) = -180° => arctan(ω) + arctan(ω/2) = 90°.\n(ω + ω/2) / (1 - ω²/2) = ∞ => 1 - ω²/2 = 0 => ω_pc = √2 rad/s.\nMagnitude at ω_pc: |G(j√2)H(j√2)| = 10 / (√2 · √(1+2) · √(2+4)) = 10 / (√2 · √3 · √6) = 10 / 6 = 5/3.\nGain Margin GM = 1 / |G(jω_pc)| = 3/5 = 0.60 (-4.44 dB, Unstable!).',
            formulaOrCode: 'ω_pc = √2 rad/s,  GM = 3/5 = -4.44 dB'
          }
        ]
      },
      {
        id: 'doc-pid-5',
        title: 'MATLAB & Simulink Control Systems Design Laboratory Manual',
        type: 'Lab Manual',
        pages: 26,
        fileSize: '3.1 MB',
        authorOrSource: 'Robotics & Control Laboratory',
        downloadFilename: 'Simulink_Control_Design_Lab_Manual.pdf',
        description: 'Practical labs for building feedback loops, analyzing step responses, and auto-tuning PID controllers with Simulink Control Design.',
        sections: [
          {
            title: 'MATLAB Command for PID Tuning',
            content: 'Create plant transfer function and use `pidtune` to automatically design controller meeting phase margin criteria.',
            formulaOrCode: 's = tf(\'s\');\nPlant = 1 / (s^2 + 2*s + 10);\n[C, info] = pidtune(Plant, \'PID\');\nClosedLoop = feedback(C*Plant, 1);\nstep(ClosedLoop);'
          }
        ]
      }
    ],
    concepts: [
      {
        id: 'concept-pid-1',
        title: 'The Trinity of Control: Present, Past, and Future Error Dynamics',
        category: 'CONTROL PHILOSOPHY',
        summary: 'Understanding how P, I, and D terms orchestrate dynamic response.',
        inDepthAnalysis: '• Proportional (P) reacts to the PRESENT error magnitude: large error produces large immediate restoring force.\n• Integral (I) aggregates PAST errors over time: guarantees zero steady-state error even under constant load disturbance (type-1 system).\n• Derivative (D) predicts the FUTURE error trajectory based on rate of change: injects anticipatory damping to arrest overshoot before it happens.',
        realWorldApplication: 'Drone flight attitude stabilizers, chemical plant reactor temperature jackets, and Tesla electric vehicle cruise control.',
        keyTakeaway: 'Over 95% of industrial closed-loop processes in power plants, oil refineries, and robotics rely on PID controllers.',
        visualDiagram: 'P (Present) + I (Past Accumulation) + D (Future Prediction)  ──>  Optimal Actuator Control'
      },
      {
        id: 'concept-pid-2',
        title: 'Derivative Kick & Filtered Derivative in Digital Implementation',
        category: 'PRACTICAL REALIZATION',
        summary: 'Why raw mathematical derivative of setpoint error fails in microcontrollers.',
        inDepthAnalysis: 'When setpoint r(t) changes abruptly (step change), de/dt becomes mathematically infinite, causing a violent "derivative kick" that damages actuators. In modern digital controllers, derivative action is computed purely on the measured output process variable y(t) rather than error e(t) (since dr/dt = 0), combined with a first-order low-pass filter to reject high-frequency sensor noise.',
        realWorldApplication: 'Embedded firmware in STM32, Arduino, and industrial PLCs (Siemens S7, Allen-Bradley).',
        keyTakeaway: 'Never differentiate raw noisy sensor signals; always use a band-limited derivative: D(s) = (N · s) / (s + N).',
        visualDiagram: 'Raw Error Step  ──>  Infinite Derivative Kick!\nOutput Differentiated  ──>  Smooth, Stable Actuator Movement'
      }
    ]
  }
};

// Helper: Generates realistic fallback video, document and concept data for any topic with 5 videos and 5 documents
export function getMediaResourcesForTopic(topicId: string, topicTitle: string, subjectTitle: string, subjectCode: string): BookContentEnrichment {
  if (BOOK_MEDIA_CATALOG[topicId]) {
    return BOOK_MEDIA_CATALOG[topicId];
  }

  // Realistic generated fallback enrichment with 5 videos and 5 documents so every single book in the entire platform has exhaustive content
  return {
    topicId,
    bookTitle: `${subjectTitle} Standard Reference Textbook (${subjectCode})`,
    videos: [
      {
        id: `vid-${topicId}-1`,
        title: `${topicTitle} — Visual Intuition & Core Principles Explained`,
        channel: '3Blue1Brown / MIT OpenCourseWare',
        duration: '18:40',
        youtubeId: 'PFDu9oVAE-g',
        topicTag: 'VISUAL INTUITION',
        instructor: 'Senior Engineering Faculty',
        institution: 'Academic Visuals Lab',
        description: `Visual walkthrough of ${topicTitle}, theoretical axioms, geometrical transformations, and core physical intuition.`,
        timestamps: [
          { time: '00:00', label: `Geometric Overview of ${topicTitle}` },
          { time: '05:30', label: 'Fundamental Invariants & Equations' },
          { time: '11:45', label: 'Key Visual Demonstrations' },
          { time: '15:20', label: 'Real-World Case Summary' }
        ]
      },
      {
        id: `vid-${topicId}-2`,
        title: `${topicTitle} — Complete University Curriculum & Derivation Masterclass`,
        channel: 'NPTEL-NOC IIT Kharagpur',
        duration: '42:15',
        youtubeId: '8hly31xKli0',
        topicTag: 'NPTEL MASTERCLASS',
        instructor: 'Professor of Engineering',
        institution: 'National Programme on Technology Enhanced Learning',
        description: `Full university lecture deriving all governing equations, boundary limits, and mathematical theorems for ${topicTitle}.`,
        timestamps: [
          { time: '00:00', label: 'Formal Problem Formulation' },
          { time: '12:20', label: 'Step-by-Step Analytical Derivation' },
          { time: '24:10', label: 'Boundary Values and Constraints' },
          { time: '35:40', label: 'Standard Proof Conclusion' }
        ]
      },
      {
        id: `vid-${topicId}-3`,
        title: `${topicTitle} Made Easy: Short Tricks, Pitfalls & Formulas`,
        channel: 'Gate Smashers',
        duration: '21:10',
        youtubeId: 'k7RM-ot2NWY',
        topicTag: 'GATE & EXAM PREP',
        instructor: 'Varun Singla',
        institution: 'Gate Smashers',
        description: `Exam shortcuts, common mistakes students make in tests, formula cheat sheets, and memory mnemonics for ${topicTitle}.`,
        timestamps: [
          { time: '00:00', label: 'Concept Overview & Tricks' },
          { time: '06:45', label: 'Formula Quick Review' },
          { time: '13:30', label: '3 Common Mistakes in University Exams' },
          { time: '18:15', label: 'Summary & Practice Tips' }
        ]
      },
      {
        id: `vid-${topicId}-4`,
        title: `${topicTitle} in Practice: Industrial Implementation & Architecture`,
        channel: 'Computerphile & Systems Engineering',
        duration: '27:30',
        youtubeId: 'v4CD6eyPOwQ',
        topicTag: 'SYSTEMS ARCHITECTURE',
        instructor: 'Principal Systems Architect',
        institution: 'Industry Systems Lab',
        description: `How ${topicTitle} is implemented in modern commercial software, avionics, microprocessors, and automotive controllers.`,
        timestamps: [
          { time: '00:00', label: 'Commercial Systems Architecture' },
          { time: '08:15', label: 'Hardware & Silicon Considerations' },
          { time: '16:50', label: 'Fault Tolerance & Error Recovery' },
          { time: '23:10', label: 'Production Case Study' }
        ]
      },
      {
        id: `vid-${topicId}-5`,
        title: `10-Year University & GATE Solved Problems on ${topicTitle}`,
        channel: 'Engineering Prep Hub',
        duration: '38:50',
        youtubeId: 'q5uM4VKy930',
        topicTag: 'WORKED PYQ PROBLEMS',
        instructor: 'Senior Examination Coach',
        institution: 'Engineering Examination Cell',
        description: `Step-by-step solutions to actual previous year examination questions on ${topicTitle} with complete marking schemes.`,
        timestamps: [
          { time: '00:00', label: '2024 Exam Question Solution' },
          { time: '11:20', label: '2022 Advanced Problem Analysis' },
          { time: '22:45', label: '2020 High-Difficulty Question' },
          { time: '32:10', label: 'Formula Substitution Shortcuts' }
        ]
      }
    ],
    documents: [
      {
        id: `doc-${topicId}-1`,
        title: `${topicTitle} Complete University & GATE Lecture Notes`,
        type: 'Lecture Notes',
        pages: 32,
        fileSize: '3.9 MB',
        authorOrSource: `${subjectTitle} Faculty Consortium • AICTE Curriculum`,
        downloadFilename: `${topicTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Lecture_Notes.pdf`,
        description: `Complete syllabus lecture notes covering all derivations, theorem boundaries, solved numerical questions, and review summaries.`,
        sections: [
          {
            title: `1. Foundational Theory of ${topicTitle}`,
            content: `This section provides the rigorous mathematical and physical formulation of ${topicTitle}. Students must master boundary conditions, governing equations, and operational constraints before approaching practical problem sets.`,
            formulaOrCode: `// Governing Equation / Invariant for ${topicTitle}\nState(t) = FundamentalTransform(Inputs, Constraints)`
          },
          {
            title: '2. Standard Analytical Method',
            content: 'Step 1: Identify all input state variables and known parameters. Step 2: Establish coordinate systems or control boundaries. Step 3: Solve governing linear equations and verify dimensional homogeneity.',
            formulaOrCode: 'Result = AnalyticalSolution(Domain, BoundaryValues)'
          },
          {
            title: '3. Theorem Derivations & Asymptotic Behavior',
            content: 'Under asymptotic expansion, the system exhibits stable equilibrium if and only if all poles possess negative real parts. Boundary layers converge exponentially.',
            formulaOrCode: 'lim_{t -> ∞} Error(t) = 0  (Under Hurwitz condition)'
          }
        ]
      },
      {
        id: `doc-${topicId}-2`,
        title: `${topicTitle} Quick Formula & Derivation Cheat Sheet`,
        type: 'Formula Sheet',
        pages: 6,
        fileSize: '820 KB',
        authorOrSource: 'Dhanya Engineering Academic Board',
        downloadFilename: `${topicTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Formula_Sheet.pdf`,
        description: 'Compact high-yield revision sheet containing all essential formulas, unit conversions, and standard constants.',
        sections: [
          {
            title: 'Core Formula Summary',
            content: `Comprehensive compilation of all formulas needed for ${topicTitle} examination problems and laboratory experiments.`,
            formulaOrCode: `Primary Relation: Y = F(X₁, X₂, ..., Xₙ)\nSensitivity: S = ∂Y / ∂X\nEfficiency: η = Output / Input × 100%`
          },
          {
            title: 'Dimensional Analysis & Units',
            content: 'Ensure all physical dimensions align with SI standard units before calculating numerical quotients.',
            formulaOrCode: '[Y] = M^a · L^b · T^c · I^d'
          }
        ]
      },
      {
        id: `doc-${topicId}-3`,
        title: `${topicTitle} 10-Year University PYQs & Model Solutions`,
        type: 'Question Bank',
        pages: 44,
        fileSize: '5.4 MB',
        authorOrSource: 'AICTE Model Curriculum Evaluation Group',
        downloadFilename: `${topicTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Question_Bank.pdf`,
        description: 'Selected previous years university questions with verified step-by-step marking scheme solutions.',
        sections: [
          {
            title: 'Question Bank Sample Question 1',
            content: `Explain the fundamental working principle of ${topicTitle}. Derive the governing expression and discuss two practical engineering applications in modern industry.`,
            formulaOrCode: 'Step 1: Define physical laws. Step 2: Formulate state equations. Step 3: Conclude with experimental validation.'
          },
          {
            title: 'Question Bank Sample Question 2 (Numerical)',
            content: `Given initial condition X(0) = 1.0 and transfer constant K = 4.5. Compute the steady state value and settling time with 2% tolerance criterion.`,
            formulaOrCode: 'X_ss = K · Input = 4.50\nSettling time t_s = 4 / (ζ · ω_n) = 1.82 s'
          }
        ]
      },
      {
        id: `doc-${topicId}-4`,
        title: `${topicTitle} Practical Laboratory Experiment Manual & Simulation Code`,
        type: 'Lab Manual',
        pages: 20,
        fileSize: '2.5 MB',
        authorOrSource: 'Department of Electrical & Computer Engineering',
        downloadFilename: `${topicTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Lab_Manual.pdf`,
        description: 'Wiring schematics, laboratory apparatus safety protocols, instrument calibration steps, and Python/MATLAB simulation scripts.',
        sections: [
          {
            title: 'Laboratory Experiment Objectives & Procedures',
            content: '1. Connect the signal sources and verify ground references.\n2. Apply step stimulus and record analog voltage responses on digital storage oscilloscope.\n3. Compute transfer coefficients and calculate experimental error percentage.',
            formulaOrCode: '% Error = |Experimental - Theoretical| / Theoretical × 100%'
          }
        ]
      },
      {
        id: `doc-${topicId}-5`,
        title: `${topicTitle} Authoritative Textbook Chapter & Technical Monograph`,
        type: 'Handbook PDF',
        pages: 50,
        fileSize: '6.2 MB',
        authorOrSource: `${subjectTitle} Standard Reference Monograph`,
        downloadFilename: `${topicTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Handbook_Chapter.pdf`,
        description: 'Deep exhaustive textbook chapter reprint covering foundational theorems, proof derivations, historical context, and advanced research directions.',
        sections: [
          {
            title: 'Historical Foundations & Mathematical Rigor',
            content: `The theoretical underpinnings of ${topicTitle} trace back to early classical formulations. Contemporary engineering synthesizes these principles into computerized simulation engines and real-time autonomous systems.`,
            formulaOrCode: 'System(s) = ∮ G(s) · H(s) ds / 2πi'
          }
        ]
      }
    ],
    concepts: [
      {
        id: `concept-${topicId}-1`,
        title: `Core Architectural Principle of ${topicTitle}`,
        category: 'THEORETICAL FOUNDATION',
        summary: `How ${topicTitle} operates at fundamental mathematical and engineering levels.`,
        inDepthAnalysis: `The study of ${topicTitle} is central to modern engineering disciplines. By understanding system invariants, transfer characteristics, and asymptotic bounds, engineers can design robust, fault-tolerant solutions under real-world physical constraints.`,
        realWorldApplication: `Widely utilized in high-performance computing, smart manufacturing, sensor networks, and aerospace guidance systems.`,
        keyTakeaway: `Mastery of ${topicTitle} provides the analytical baseline required for advanced research and industry specialization.`,
        visualDiagram: `Inputs & Excitations  ──>  [ ${topicTitle} Mechanism ]  ──>  Optimized System Output`
      },
      {
        id: `concept-${topicId}-2`,
        title: `Industrial Implementation & Real-World Case Study`,
        category: 'ENGINEERING PRACTICE',
        summary: `Translating theory into high-reliability production systems.`,
        inDepthAnalysis: `In commercial implementations, idealized textbook assumptions face noise, thermal drift, finite computational precision, and component tolerances. Robust designs incorporate closed-loop feedback, error-correcting codes, and automated calibration routines to ensure long-term stability.`,
        realWorldApplication: `Industrial automation, critical telecommunications backbones, automotive safety controllers, and medical diagnostic instruments.`,
        keyTakeaway: `Real-world engineering balances theoretical optimality with manufacturing tolerances and cost constraints.`,
        visualDiagram: `Theory Specification  ──>  Tolerance & Noise Analysis  ──>  Production Deployment`
      },
      {
        id: `concept-${topicId}-3`,
        title: `Optimization & Modern Computational Methods in ${topicTitle}`,
        category: 'MODERN RESEARCH',
        summary: `Leveraging numerical solvers and machine learning to accelerate problem solving.`,
        inDepthAnalysis: `Modern engineers use finite element analysis (FEA), numerical integration, and neural surrogate models to optimize ${topicTitle} parameters in real time without requiring slow trial-and-error laboratory iterations.`,
        realWorldApplication: `Autonomous vehicle trajectory planners, real-time power grid stabilization, and cloud database query planners.`,
        keyTakeaway: `Computational numerical methods bridge the gap between abstract mathematical formulas and millisecond-latency hardware execution.`,
        visualDiagram: `Physical Model  ──>  Discretization  ──>  Numerical Solver  ──>  Real-Time Control`
      }
    ]
  };
}
