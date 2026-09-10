export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TopicExplanation {
  id: string;
  subjectId: string;
  title: string;
  unitNumber: number;
  unitTitle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  simpleExplanation: string;
  detailedExplanation: string;
  importantConcepts: string[];
  examples: Array<{ title: string; problem: string; solution: string }>;
  formulasOrCode: {
    type: 'formula' | 'code';
    language?: string;
    content: string;
    caption: string;
  };
  stepByStep: Array<{ step: number; title: string; description: string }>;
  keyPoints: string[];
  commonMistakes: string[];
  quickRevision: string[];
  assessmentQuestions: AssessmentQuestion[];
  referenceCitation?: string;
}

export interface Subject {
  id: string;
  title: string;
  code: string;
  department: string;
  credits: number;
  icon: string;
  accent: string;
  accentLight: string;
  badgeColor: string;
  description: string;
  topicsCount: number;
  topics: TopicExplanation[];
}

export const SUBJECTS_DATA: Subject[] = [
  // ==========================================
  // 1. MATHEMATICS (MATH-201)
  // ==========================================
  {
    id: 'mathematics',
    title: 'Mathematics',
    code: 'MATH-201',
    department: 'Applied Sciences & Mathematics',
    credits: 4,
    icon: '∑',
    accent: '#3B82F6',
    accentLight: 'rgba(59, 130, 246, 0.12)',
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    description: 'Linear algebra, matrix decompositions, Fourier analysis, multivariable calculus, and differential equations.',
    topicsCount: 4,
    topics: [
      {
        id: 'math-eigen',
        subjectId: 'mathematics',
        title: 'Eigenvalues & Eigenvectors',
        unitNumber: 1,
        unitTitle: 'Linear Algebra & Matrix Transformations',
        difficulty: 'Intermediate',
        estimatedMinutes: 45,
        referenceCitation: 'Ref: B.S. Grewal - Higher Engineering Mathematics, §4.2; Gilbert Strang §6.1',
        simpleExplanation:
          'When a matrix transforms a vector, most vectors change both their length and direction. But special vectors only stretch or shrink without rotating at all. These special vectors are eigenvectors, and their scaling factor is the eigenvalue.',
        detailedExplanation:
          'In linear algebra, an eigenvector of a square matrix A is a non-zero vector v that satisfies the characteristic equation Av = λv, where λ is a scalar known as the eigenvalue. To compute the eigenvalues, we solve the characteristic equation det(A - λI) = 0. Once eigenvalues are found, each corresponding eigenvector is determined by finding the null space of (A - λI). This forms the basis for Principal Component Analysis (PCA), structural resonance modes, and Google PageRank.',
        importantConcepts: [
          'Characteristic Equation: det(A - λI) = 0',
          'Trace Theorem: The sum of eigenvalues equals the trace of the matrix (∑ λᵢ = tr(A))',
          'Determinant Theorem: The product of eigenvalues equals the determinant (∏ λᵢ = det(A))',
          'Diagonalisation: If matrix A has n linearly independent eigenvectors, A = PDP⁻¹',
          'Cayley-Hamilton Theorem: Every square matrix satisfies its own characteristic equation'
        ],
        examples: [
          {
            title: 'Finding Eigenvalues of a 2x2 Matrix',
            problem: 'Find the eigenvalues of A = [[4, 2], [1, 3]].',
            solution:
              'Set det(A - λI) = 0:\\n| 4 - λ    2   |\\n|   1    3 - λ |\\n= (4 - λ)(3 - λ) - (2)(1) = 0\\nλ² - 7λ + 12 - 2 = 0\\nλ² - 7λ + 10 = 0\\n(λ - 2)(λ - 5) = 0\\nTherefore, eigenvalues are λ₁ = 2 and λ₂ = 5.'
          }
        ],
        formulasOrCode: {
          type: 'formula',
          content: 'A \\cdot v = \\lambda \\cdot v \\quad \\Longleftrightarrow \\quad \\det(A - \\lambda I) = 0',
          caption: 'Fundamental Eigenvalue Equation and Characteristic Determinant'
        },
        stepByStep: [
          { step: 1, title: 'Form the Matrix (A - λI)', description: 'Subtract scalar λ from each diagonal entry of square matrix A.' },
          { step: 2, title: 'Compute the Determinant', description: 'Calculate det(A - λI) to formulate the characteristic polynomial equation.' },
          { step: 3, title: 'Solve the Roots', description: 'Factor the characteristic polynomial to solve for the scalar roots λ₁, λ₂, ..., λₙ.' },
          { step: 4, title: 'Find Eigenvectors', description: 'Substitute each λ back into (A - λI)v = 0 and solve the homogeneous system using Gaussian elimination.' }
        ],
        keyPoints: [
          'Eigenvalues can be real, repeated, or complex conjugates.',
          'Real symmetric matrices always have purely real eigenvalues and orthogonal eigenvectors.',
          'An n×n matrix always has exactly n eigenvalues counting algebraic multiplicities.'
        ],
        commonMistakes: [
          'Forgetting that the zero vector cannot be an eigenvector by definition.',
          'Sign errors when computing (a - λ)(d - λ) in 2x2 determinants.',
          'Confusing algebraic multiplicity with geometric multiplicity.'
        ],
        quickRevision: [
          'det(A - λI) = 0 yields eigenvalues.',
          'Sum of λ = Trace(A).',
          'Product of λ = det(A).'
        ],
        assessmentQuestions: [
          {
            id: 'q1',
            question: 'What is the characteristic equation used to determine the eigenvalues of an n×n matrix A?',
            options: ['det(A + λI) = 0', 'det(A - λI) = 0', 'trace(A) · λ = 0', 'Av = 0'],
            correctIndex: 1,
            explanation: 'The characteristic equation is derived from (A - λI)v = 0 having non-trivial solutions, which requires det(A - λI) = 0.'
          },
          {
            id: 'q2',
            question: 'If the eigenvalues of a 2×2 matrix are 3 and 7, what is the determinant of the matrix?',
            options: ['10', '21', '4', '0'],
            correctIndex: 1,
            explanation: 'The determinant of a matrix is equal to the product of its eigenvalues: 3 × 7 = 21.'
          },
          {
            id: 'q3',
            question: 'Which theorem states that every square matrix satisfies its own characteristic equation?',
            options: ['Cramer’s Rule', 'Rolle’s Theorem', 'Cayley-Hamilton Theorem', 'Gauss-Jordan Theorem'],
            correctIndex: 2,
            explanation: 'The Cayley-Hamilton Theorem states that substituting matrix A into its own characteristic polynomial P(λ) gives P(A) = 0.'
          }
        ]
      },
      {
        id: 'math-fourier',
        subjectId: 'mathematics',
        title: 'Fourier Series & Harmonic Analysis',
        unitNumber: 2,
        unitTitle: 'Harmonic Analysis & Periodic Signals',
        difficulty: 'Intermediate',
        estimatedMinutes: 50,
        referenceCitation: 'Ref: Erwin Kreyszig - Advanced Engineering Mathematics, 10th Ed., Ch. 11',
        simpleExplanation:
          'Any periodic sound wave, vibration, or repeating signal can be broken down into a sum of pure, simple sine and cosine waves of different frequencies and heights.',
        detailedExplanation:
          'Fourier series represents any piecewise continuous periodic function f(x) with period 2L as an infinite sum of harmonically related sines and cosines. The coefficients a₀, aₙ, and bₙ are determined via orthogonality properties of sinusoidal functions over the period [-L, L]. Fourier analysis is vital in telecommunications, acoustics, circuit frequency responses, and digital audio compression.',
        importantConcepts: [
          'Orthogonality of Sinusoids: ∫ cos(nπx/L) cos(mπx/L) dx = 0 for m ≠ n',
          'Even Functions: Contain only cosine terms (bₙ = 0), aₙ = (2/L) ∫₀ᴸ f(x)cos(nπx/L)dx',
          'Odd Functions: Contain only sine terms (a₀ = 0, aₙ = 0), bₙ = (2/L) ∫₀ᴸ f(x)sin(nπx/L)dx',
          'Dirichlet Conditions: Sufficient criteria for Fourier series convergence at points of discontinuity',
          'Parseval Identity: Relates signal energy in time domain to sum of squared Fourier coefficients'
        ],
        examples: [
          {
            title: 'Fourier Coefficients of Square Wave',
            problem: 'Find the Fourier series of f(x) = -1 for -π < x < 0, and f(x) = +1 for 0 < x < π.',
            solution:
              'Since f(x) is an odd function, a₀ = 0 and aₙ = 0.\\nbₙ = (2/π) ∫₀^π (1) sin(nx) dx = (2/nπ) [ -cos(nx) ]₀^π = (2/nπ) [ 1 - (-1)ⁿ ].\\nFor even n, bₙ = 0. For odd n = 1, 3, 5..., bₙ = 4 / (nπ).\\nThus: f(x) = (4/π) [ sin(x) + (1/3)sin(3x) + (1/5)sin(5x) + ... ].'
          }
        ],
        formulasOrCode: {
          type: 'formula',
          content: 'f(x) = \\frac{a_0}{2} + \\sum_{n=1}^{\\infty} \\left[ a_n \\cos\\left(\\frac{n\\pi x}{L}\\right) + b_n \\sin\\left(\\frac{n\\pi x}{L}\\right) \\right]',
          caption: 'Fourier Series Expansion of a Periodic Function with Period 2L'
        },
        stepByStep: [
          { step: 1, title: 'Inspect Symmetry', description: 'Determine whether f(x) is even f(-x)=f(x), odd f(-x)=-f(x), or neither to eliminate unnecessary coefficient integrations.' },
          { step: 2, title: 'Calculate a₀', description: 'Compute the average DC value of the function over one complete period.' },
          { step: 3, title: 'Integrate aₙ & bₙ', description: 'Use integration by parts or Euler-Bernoulli formulas to evaluate harmonic coefficients.' },
          { step: 4, title: 'Synthesize Series', description: 'Substitute coefficients into the general Fourier expansion formula and state interval of convergence.' }
        ],
        keyPoints: [
          'At jump discontinuities, the Fourier series converges to the arithmetic mean of left and right limits: (f(x⁺) + f(x⁻))/2.',
          'Gibbs phenomenon occurs near discontinuities, resulting in an ~9% overshoot.'
        ],
        commonMistakes: [
          'Forgetting that a₀/2 has the factor of 1/2 in the series definition.',
          'Integrating over [0, L] instead of [-L, L] without adjusting symmetry multipliers.'
        ],
        quickRevision: [
          'Even functions -> only Cosines.',
          'Odd functions -> only Sines.',
          'At jumps -> Average of limits.'
        ],
        assessmentQuestions: [
          {
            id: 'q_fou1',
            question: 'What is the value of Fourier coefficient bₙ for any symmetric even function f(-x) = f(x)?',
            options: ['bₙ = 1', 'bₙ = 0', 'bₙ = aₙ', 'bₙ = 2/π'],
            correctIndex: 1,
            explanation: 'For even functions, multiplying with the odd function sin(nx) gives an odd integrand whose integral over symmetric bounds [-L, L] is zero.'
          },
          {
            id: 'q_fou2',
            question: 'What value does the Fourier series converge to at a point of jump discontinuity x = c?',
            options: ['0', 'f(c⁺)', 'f(c⁻)', '[f(c⁺) + f(c⁻)] / 2'],
            correctIndex: 3,
            explanation: 'According to Dirichlet conditions, at a jump discontinuity the series converges to the midpoint of the left-hand and right-hand limits.'
          }
        ]
      },
      {
        id: 'math-calculus',
        subjectId: 'mathematics',
        title: 'Multivariable Calculus & Gradient Vectors',
        unitNumber: 3,
        unitTitle: 'Multivariable Functions & Optimization',
        difficulty: 'Advanced',
        estimatedMinutes: 40,
        referenceCitation: 'Ref: James Stewart - Multivariable Calculus, 8th Ed., Ch. 14',
        simpleExplanation:
          'If you stand on a hilly terrain, the slope depends on which direction you walk. The gradient vector points exactly uphill in the direction of steepest climb, and its magnitude is how steep that climb is.',
        detailedExplanation:
          'For a scalar field f(x, y, z), the gradient ∇f is a vector field consisting of partial derivatives [∂f/∂x, ∂f/∂y, ∂f/∂z]. It possesses the critical geometric property of being normal to level surfaces f(x, y, z) = c. Directional derivatives evaluate instantaneous rates of change along arbitrary unit vectors. This forms the bedrock of Gradient Descent optimization algorithms in Machine Learning and potential theory in Physics.',
        importantConcepts: [
          'Gradient Vector: ∇f = (∂f/∂x)i + (∂f/∂y)j + (∂f/∂z)k',
          'Directional Derivative: Dᵤf = ∇f · u (maximum when u is parallel to ∇f)',
          'Hessian Matrix: Matrix of second-order partial derivatives for local extrema classification',
          'Lagrange Multipliers: ∇f = λ∇g for constrained optimization problems'
        ],
        examples: [
          {
            title: 'Direction of Maximum Increase',
            problem: 'For f(x, y) = x²y + 3xy², find the gradient vector at point (1, 2).',
            solution:
              '∂f/∂x = 2xy + 3y²\\n∂f/∂y = x² + 6xy\\nAt (1, 2):\\n∂f/∂x = 2(1)(2) + 3(4) = 4 + 12 = 16\\n∂f/∂y = 1² + 6(1)(2) = 1 + 12 = 13\\nGradient ∇f(1, 2) = 16i + 13j.'
          }
        ],
        formulasOrCode: {
          type: 'formula',
          content: '\\nabla f(x, y, z) = \\left[ \\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y}, \\frac{\\partial f}{\\partial z} \\right], \\quad D_{\\mathbf{u}}f = \\nabla f \\cdot \\mathbf{u}',
          caption: 'Gradient Vector and Directional Derivative Definition'
        },
        stepByStep: [
          { step: 1, title: 'Compute Partial Derivatives', description: 'Differentiate f with respect to each variable while treating all other variables as constants.' },
          { step: 2, title: 'Evaluate at Specified Point', description: 'Substitute coordinate values (x₀, y₀, z₀) into the partial derivative expressions.' },
          { step: 3, title: 'Form Vector', description: 'Combine partials into component vector [f_x, f_y, f_z].' }
        ],
        keyPoints: [
          'The gradient is always perpendicular (orthogonal) to contour lines / level curves.',
          'Magnitude ||∇f|| represents the maximum possible rate of increase.'
        ],
        commonMistakes: [
          'Computing directional derivative without normalizing the direction vector u to unit length (||u|| = 1).',
          'Confusing gradient (vector output from scalar field) with divergence (scalar output from vector field).'
        ],
        quickRevision: [
          '∇f points to steepest increase.',
          '||∇f|| = max directional derivative.',
          '∇f ⊥ level curves.'
        ],
        assessmentQuestions: [
          {
            id: 'q_calc1',
            question: 'In which direction does the directional derivative Dᵤf attain its maximum value?',
            options: ['Opposite to ∇f', 'Perpendicular to ∇f', 'In the direction of ∇f', 'Tangent to level curve'],
            correctIndex: 2,
            explanation: 'Since Dᵤf = ||∇f|| ||u|| cos(θ), the maximum occurs when cos(θ) = 1, meaning u is in the exact direction of ∇f.'
          }
        ]
      },
      {
        id: 'math-differential',
        subjectId: 'mathematics',
        title: 'Differential Equations & Laplace Transforms',
        unitNumber: 4,
        unitTitle: 'Ordinary Differential Equations & System Dynamics',
        difficulty: 'Advanced',
        estimatedMinutes: 45,
        referenceCitation: 'Ref: Boyce & DiPrima - Elementary Differential Equations, 11th Ed., Ch. 6',
        simpleExplanation:
          'Differential equations describe how things change over time (like cooling coffee or a swinging pendulum). Laplace transforms convert hard calculus problems with derivatives into easy high school algebra problems.',
        detailedExplanation:
          'Laplace transformation maps a time-domain function f(t) into the complex frequency s-domain via the integral L{f(t)} = ∫₀^∞ e^(-st) f(t) dt. It transforms differential equations into algebraic polynomials, making it the premier analytical technique for solving linear time-invariant (LTI) mechanical vibrations, RLC circuits, and control systems with initial values.',
        importantConcepts: [
          'First Derivative Transform: L{f\'(t)} = sF(s) - f(0)',
          'Second Derivative Transform: L{f\'\'(t)} = s²F(s) - sf(0) - f\'(0)',
          'First Shifting Theorem: L{e^(at) f(t)} = F(s - a)',
          'Convolution Theorem: L{f(t) * g(t)} = F(s) · G(s)'
        ],
        examples: [
          {
            title: 'Laplace of Exponential Oscillation',
            problem: 'Find L{e^(3t) cos(2t)}.',
            solution:
              'Known standard transform: L{cos(2t)} = s / (s² + 2²) = s / (s² + 4).\\nUsing First Shifting Property L{e^(at)f(t)} = F(s - a) with a = 3:\\nL{e^(3t) cos(2t)} = (s - 3) / [ (s - 3)² + 4 ] = (s - 3) / (s² - 6s + 13).'
          }
        ],
        formulasOrCode: {
          type: 'formula',
          content: '\\mathcal{L}\\{f(t)\\} = F(s) = \\int_{0}^{\\infty} e^{-st} f(t) \\, dt, \\quad \\mathcal{L}\\{f\'\'(t)\\} = s^2F(s) - sf(0) - f\'(0)',
          caption: 'Laplace Integral Operator and Second Derivative Operational Rule'
        },
        stepByStep: [
          { step: 1, title: 'Take Laplace of Both Sides', description: 'Apply linear transform and substitute initial conditions into derivative formulas.' },
          { step: 2, title: 'Solve for F(s)', description: 'Use basic algebra to isolate the unknown s-domain response F(s).' },
          { step: 3, title: 'Partial Fractions', description: 'Decompose rational function F(s) into elementary partial fractions.' },
          { step: 4, title: 'Inverse Laplace Transform', description: 'Look up inverse transforms to recover exact time-domain solution y(t).' }
        ],
        keyPoints: [
          'Initial conditions are baked directly into the algebraic transformation.',
          'Heaviside unit step functions easily model discontinuous forces like switches.'
        ],
        commonMistakes: [
          'Missing the initial condition signs: remember -sf(0) - f\'(0).',
          'Incorrect quadratic denominator factoring when identifying complex poles.'
        ],
        quickRevision: [
          'L{f\'} = sF(s) - f(0).',
          'L{e^(at)} = 1/(s-a).',
          'L{sin(ωt)} = ω/(s²+ω²).'
        ],
        assessmentQuestions: [
          {
            id: 'q_diff1',
            question: 'What is the Laplace transform of the function f(t) = 1 (unit step)?',
            options: ['1', '1/s', 's', 'e^(-s)'],
            correctIndex: 1,
            explanation: 'Evaluating ∫₀^∞ e^(-st) (1) dt = [-e^(-st)/s]₀^∞ = 1/s for Re(s) > 0.'
          }
        ]
      }
    ]
  },

  // ==========================================
  // 2. PHYSICS (PHY-101)
  // ==========================================
  {
    id: 'physics',
    title: 'Physics',
    code: 'PHY-101',
    department: 'Applied Sciences & Engineering Physics',
    credits: 4,
    icon: '⚛',
    accent: '#06B6D4',
    accentLight: 'rgba(6, 182, 212, 0.12)',
    badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    description: 'Quantum mechanics, wave-particle duality, semiconductor lasers, Maxwell electrodynamics, and fiber optics.',
    topicsCount: 4,
    topics: [
      {
        id: 'phy-quantum',
        subjectId: 'physics',
        title: 'Wave-Particle Duality & De Broglie Hypothesis',
        unitNumber: 1,
        unitTitle: 'Quantum Mechanics & Modern Physics',
        difficulty: 'Intermediate',
        estimatedMinutes: 40,
        referenceCitation: 'Ref: Arthur Beiser - Concepts of Modern Physics, 6th Ed., Ch. 3',
        simpleExplanation:
          'Light behaves like both a continuous ripple in water (wave) and a beam of tiny ping-pong balls (particles). De Broglie realized that matter, like electrons, behaves the exact same way.',
        detailedExplanation:
          'In 1924, Louis de Broglie hypothesized that if light exhibits dual particle-wave characteristics, matter particles in motion must also possess wave-like properties. The wavelength of a particle is given by λ = h / p, where h is Planck’s constant and p is momentum (mv). This laid the mathematical foundation for wave mechanics and Schrödinger’s equation.',
        importantConcepts: [
          'De Broglie Relation: λ = h / p = h / (mv)',
          'Heisenberg Uncertainty Principle: Δx · Δp ≥ ℏ / 2',
          'Wave Function: Ψ(x, t) whose modulus squared |Ψ|² represents probability density',
          'Davisson-Germer Experiment: Verified wave nature of electrons through crystal diffraction'
        ],
        examples: [
          {
            title: 'Wavelength of an Accelerated Electron',
            problem: 'Calculate the de Broglie wavelength of an electron accelerated through an electric potential of 100 Volts.',
            solution: 'Using λ = 1.227 / √V nm:\\nλ = 1.227 / √100 = 1.227 / 10 = 0.1227 nm (or 1.23 Å). This matches X-ray wavelengths and enables electron microscopy.'
          }
        ],
        formulasOrCode: {
          type: 'formula',
          content: '\\lambda = \\frac{h}{p} = \\frac{h}{m \\cdot v} = \\frac{1.227}{\\sqrt{V}} \\text{ nm}, \\quad \\Delta x \\cdot \\Delta p \\ge \\frac{\\hbar}{2}',
          caption: 'De Broglie Matter Wavelength and Heisenberg Uncertainty Invariant'
        },
        stepByStep: [
          { step: 1, title: 'Find Momentum', description: 'Determine the classical momentum p = mv or p = √(2mE).' },
          { step: 2, title: 'Apply Planck Constant', description: 'Divide Planck constant h (6.626 × 10⁻³⁴ J·s) by momentum.' },
          { step: 3, title: 'Verify Scale', description: 'For macroscopic objects, λ is negligible; for microscopic particles (electrons), λ is significant.' }
        ],
        keyPoints: [
          'Macroscopic objects have undetectable de Broglie wavelengths because mass m is large.',
          'Davisson-Germer electron diffraction proved electron wave properties experimentally.'
        ],
        commonMistakes: [
          'Using velocity instead of momentum in the denominator.',
          'Forgetting that electromagnetic waves travel at c, while matter waves travel at particle velocity v.'
        ],
        quickRevision: [
          'λ = h / p.',
          'Wavelength is inversely proportional to momentum.',
          'Electron microscope resolution exceeds optical microscope due to tiny λ.'
        ],
        assessmentQuestions: [
          {
            id: 'q_phy1',
            question: 'What is the relationship between de Broglie wavelength (λ) and momentum (p)?',
            options: ['λ = h · p', 'λ = h / p', 'λ = p / h', 'λ = h / p²'],
            correctIndex: 1,
            explanation: 'De Broglie postulated that the wavelength is inversely proportional to momentum: λ = h / p.'
          },
          {
            id: 'q_phy2',
            question: 'If the velocity of an electron is doubled, what happens to its de Broglie wavelength?',
            options: ['Doubles', 'Quadruples', 'Halved', 'Remains unchanged'],
            correctIndex: 2,
            explanation: 'Since λ = h / (m · v), doubling velocity v halves the wavelength λ.'
          }
        ]
      },
      {
        id: 'phy-laser',
        subjectId: 'physics',
        title: 'Laser Dynamics & Optical Fibers',
        unitNumber: 2,
        unitTitle: 'Optoelectronics & Coherent Light',
        difficulty: 'Beginner',
        estimatedMinutes: 35,
        referenceCitation: 'Ref: Ajoy Ghatak - Optics, 7th Ed., Ch. 26',
        simpleExplanation:
          'A normal light bulb throws light waves in every messy direction and color. A laser forces photons to march in lockstep unison, creating a razor-sharp, monochromatic beam of pure coherent light.',
        detailedExplanation:
          'LASER (Light Amplification by Stimulated Emission of Radiation) operates via population inversion, optical pumping, and resonant optical cavity feedback. An incoming photon stimulates an excited electron to drop energy levels, releasing an identical twin photon with identical wavelength, phase, and direction. Optical fibers guide these laser signals over continents via Total Internal Reflection (TIR).',
        importantConcepts: [
          'Population Inversion: N₂ > N₁ achieved via metastable intermediate states',
          'Stimulated Emission: Incoming photon triggers emission of identical coherent photon',
          'Optical Cavity Resonator: Highly reflective mirrors providing positive photon feedback',
          'Numerical Aperture (NA): Light-gathering capacity of optical fiber NA = √(n₁² - n₂²)'
        ],
        examples: [
          {
            title: 'Numerical Aperture of Optical Fiber',
            problem: 'Core refractive index n₁ = 1.50 and cladding index n₂ = 1.45. Find the Acceptance Angle θ_a.',
            solution:
              'NA = √(n₁² - n₂²) = √(1.50² - 1.45²) = √(2.25 - 2.1025) = √0.1475 ≈ 0.384.\\nAcceptance Angle θ_a = arcsin(NA) = arcsin(0.384) ≈ 22.6°.'
          }
        ],
        formulasOrCode: {
          type: 'formula',
          content: 'NA = \\sin \\theta_a = \\sqrt{n_1^2 - n_2^2}, \\quad V = \\frac{2\\pi a}{\\lambda} \\sqrt{n_1^2 - n_2^2}',
          caption: 'Numerical Aperture and V-Number (Normalized Frequency) of Optical Fiber'
        },
        stepByStep: [
          { step: 1, title: 'Energy Absorption', description: 'Pumping source excites ground state atoms into upper energy bands.' },
          { step: 2, title: 'Metastable Trapping', description: 'Non-radiative decay traps atoms in metastable state, creating population inversion.' },
          { step: 3, title: 'Stimulated Cascade', description: 'A spontaneously emitted photon induces a cascade of coherent stimulated emissions.' }
        ],
        keyPoints: [
          'Laser light is monochromatic, highly directional, and spatially and temporally coherent.',
          'For optical fibers, core index n₁ must always be strictly greater than cladding index n₂.'
        ],
        commonMistakes: [
          'Assuming stimulated emission happens spontaneously without an initiator photon.',
          'Confusing acceptance angle with critical angle θ_c.'
        ],
        quickRevision: [
          'Laser = Population Inversion + Stimulated Emission.',
          'TIR requires n_core > n_cladding.',
          'NA = √(n₁² - n₂²).'
        ],
        assessmentQuestions: [
          {
            id: 'q_las1',
            question: 'What is the necessary condition for laser action to occur between two energy states?',
            options: ['N₁ > N₂', 'Population Inversion (N₂ > N₁)', 'Spontaneous emission only', 'n₁ < n₂'],
            correctIndex: 1,
            explanation: 'Population inversion ensures stimulated emission dominates over absorption.'
          }
        ]
      },
      {
        id: 'phy-maxwell',
        subjectId: 'physics',
        title: 'Maxwell Equations & EM Wave Propagation',
        unitNumber: 3,
        unitTitle: 'Electrodynamics & Field Theory',
        difficulty: 'Advanced',
        estimatedMinutes: 50,
        referenceCitation: 'Ref: David J. Griffiths - Introduction to Electrodynamics, 4th Ed., Ch. 7-9',
        simpleExplanation:
          'A changing electric field creates a magnetic field, and a changing magnetic field creates an electric field. Together, they leapfrog each other through empty space at the speed of light: that is an electromagnetic wave.',
        detailedExplanation:
          'James Clerk Maxwell unified electricity and magnetism into four partial differential equations. By introducing the Displacement Current term J_d = ε₀ ∂E/∂t into Ampere\'s Law, Maxwell resolved charge conservation discrepancies and demonstrated that oscillating electromagnetic fields propagate as transverse waves with velocity c = 1/√(μ₀ε₀).',
        importantConcepts: [
          'Gauss’s Law for Electricity: ∇ · E = ρ / ε₀',
          'Gauss’s Law for Magnetism: ∇ · B = 0 (No magnetic monopoles)',
          'Faraday’s Law of Induction: ∇ × E = -∂B / ∂t',
          'Ampère-Maxwell Law: ∇ × B = μ₀J + μ₀ε₀(∂E / ∂t)',
          'Poynting Vector: S = (1/μ₀)(E × B) represents directional power flux (W/m²)'
        ],
        examples: [
          {
            title: 'Speed of Light from Fundamental Constants',
            problem: 'Calculate wave speed c using μ₀ = 4π × 10⁻⁷ H/m and ε₀ = 8.854 × 10⁻¹² F/m.',
            solution:
              'c = 1 / √(μ₀ε₀) = 1 / √((4π × 10⁻⁷)(8.854 × 10⁻¹²)) = 1 / √(1.1126 × 10⁻¹⁷) = 2.998 × 10⁸ m/s. This proved light is an electromagnetic wave.'
          }
        ],
        formulasOrCode: {
          type: 'formula',
          content: '\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}, \\quad \\nabla \\times \\mathbf{B} = \\mu_0 \\mathbf{J} + \\mu_0\\varepsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t}, \\quad c = \\frac{1}{\\sqrt{\\mu_0\\varepsilon_0}}',
          caption: 'Faraday and Ampère-Maxwell Curl Equations and Speed of Propagation'
        },
        stepByStep: [
          { step: 1, title: 'Take Curl of Faraday Law', description: 'Compute ∇ × (∇ × E) = ∇(∇·E) - ∇²E.' },
          { step: 2, title: 'Apply Free-Space Conditions', description: 'Set charge density ρ = 0 and conduction current J = 0.' },
          { step: 3, title: 'Substitute Ampere-Maxwell Law', description: 'Replace ∂/∂t(∇ × B) to yield the classic 3D wave equation ∇²E = μ₀ε₀ ∂²E/∂t².' }
        ],
        keyPoints: [
          'E and B fields oscillate in phase, perpendicular to each other and to the propagation direction.',
          'The ratio of field amplitudes in vacuum is E₀ / B₀ = c.'
        ],
        commonMistakes: [
          'Forgetting the displacement current term (Maxwell’s critical addition).',
          'Assuming longitudinal EM waves can exist in free space (they are strictly transverse).'
        ],
        quickRevision: [
          '∇·B = 0 (No monopoles).',
          'c = 1/√(μ₀ε₀).',
          'Poynting vector S = (E × B)/μ₀.'
        ],
        assessmentQuestions: [
          {
            id: 'q_max1',
            question: 'Which of Maxwell\'s equations directly proves that isolated magnetic monopoles do not exist in nature?',
            options: ['∇ · E = ρ/ε₀', '∇ · B = 0', '∇ × E = -∂B/∂t', '∇ × B = μ₀J'],
            correctIndex: 1,
            explanation: '∇ · B = 0 implies magnetic flux lines always form continuous closed loops without sources or sinks.'
          }
        ]
      },
      {
        id: 'phy-schrodinger',
        subjectId: 'physics',
        title: 'Schrödinger Wave Equation & Potential Wells',
        unitNumber: 4,
        unitTitle: 'Quantum Confinement & Boundary Value Problems',
        difficulty: 'Advanced',
        estimatedMinutes: 50,
        referenceCitation: 'Ref: David J. Griffiths - Introduction to Quantum Mechanics, 3rd Ed., Ch. 2',
        simpleExplanation:
          'In classical physics, a trapped ball can bounce with any speed. In quantum physics, a trapped electron can only vibrate at specific discrete musical pitches: its energy is quantized into rungs of a ladder.',
        detailedExplanation:
          'The Time-Independent Schrödinger Equation (TISE) is an eigenvalue problem Ĥψ = Eψ where Ĥ = -(ℏ²/2m)d²/dx² + V(x). For an infinite square potential well (particle in a box of width L), applying Dirichlet boundary conditions ψ(0)=0 and ψ(L)=0 restricts permissible wave numbers to k_n = nπ/L, yielding discrete energy levels E_n = (n²h²)/(8mL²). This explains atomic emission spectra and semiconductor quantum wells.',
        importantConcepts: [
          'TISE: - (ℏ²/2m) ∇²ψ + V(x)ψ = Eψ',
          'Normalization Condition: ∫_{-∞}^{+∞} |ψ(x)|² dx = 1',
          'Zero-Point Energy: E₁ > 0 (particle can never be completely at rest due to uncertainty principle)',
          'Quantum Tunneling: Finite probability of penetrating a barrier V₀ > E'
        ],
        examples: [
          {
            title: 'Ground State Energy in a 1D Box',
            problem: 'Calculate the ratio of the second excited state energy (n=3) to the ground state energy (n=1).',
            solution:
              'E_n ∝ n².\\nE₃ / E₁ = (3)² / (1)² = 9 / 1 = 9.\\nThe energy of the n=3 level is exactly 9 times the ground state energy.'
          }
        ],
        formulasOrCode: {
          type: 'formula',
          content: '-\\frac{\\hbar^2}{2m} \\frac{d^2\\psi}{dx^2} + V(x)\\psi = E\\psi, \\quad E_n = \\frac{n^2 h^2}{8mL^2} = \\frac{n^2 \\pi^2 \\hbar^2}{2mL^2}',
          caption: '1D Time-Independent Schrödinger Equation and Quantized Energy Eigenvalues'
        },
        stepByStep: [
          { step: 1, title: 'Set Up Regions', description: 'Define potential V(x) inside and outside the well boundary.' },
          { step: 2, title: 'Apply General Solution', description: 'Write sinusoidal solution ψ(x) = A sin(kx) + B cos(kx) inside the box.' },
          { step: 3, title: 'Enforce Boundary Conditions', description: 'Set ψ(0)=0 (forces B=0) and ψ(L)=0 (forces kL = nπ).' },
          { step: 4, title: 'Normalize', description: 'Evaluate ∫ |ψ|² dx = 1 to find amplitude A = √(2/L).' }
        ],
        keyPoints: [
          'Energy is quantized: n = 1, 2, 3... (n=0 is not allowed as ψ would vanish everywhere).',
          'Higher quantum numbers n have n-1 internal nodes.'
        ],
        commonMistakes: [
          'Setting n = 0 as the ground state (n=1 is the true ground state).',
          'Forgetting that energy scales with n² (not linearly with n).'
        ],
        quickRevision: [
          'E_n ∝ n².',
          'ψ_n(x) = √(2/L) sin(nπx/L).',
          'Zero-point energy is never zero.'
        ],
        assessmentQuestions: [
          {
            id: 'q_sch1',
            question: 'Why is the quantum number n = 0 forbidden for a particle in an infinite 1D potential well?',
            options: ['Energy would be infinite', 'The wave function becomes zero everywhere, violating normalization', 'It violates conservation of charge', 'Velocity exceeds speed of light'],
            correctIndex: 1,
            explanation: 'If n = 0, ψ(x) = √(2/L) sin(0) = 0 everywhere, meaning the probability of finding the particle anywhere is zero.'
          }
        ]
      }
    ]
  },

  // ==========================================
  // 3. PROGRAMMING (CSE-102)
  // ==========================================
  {
    id: 'programming',
    title: 'Programming',
    code: 'CSE-102',
    department: 'Computer Science & Engineering',
    credits: 4,
    icon: '⌨',
    accent: '#2563EB',
    accentLight: 'rgba(37, 99, 235, 0.12)',
    badgeColor: 'bg-blue-600/15 text-blue-400 border-blue-600/30',
    description: 'C/C++ low-level systems programming, pointers, bitwise arithmetic, stack memory, recursion, and file streams.',
    topicsCount: 4,
    topics: [
      {
        id: 'prog-pointers',
        subjectId: 'programming',
        title: 'Pointers & Dynamic Memory Allocation',
        unitNumber: 1,
        unitTitle: 'Memory Models & Pointer Arithmetic',
        difficulty: 'Beginner',
        estimatedMinutes: 35,
        referenceCitation: 'Ref: Brian Kernighan & Dennis Ritchie - The C Programming Language, 2nd Ed., Ch. 5',
        simpleExplanation:
          'A normal variable holds data like the number 42. A pointer is a variable that holds the house address (memory location) where that number 42 is stored in RAM.',
        detailedExplanation:
          'Pointers are variables that store memory addresses of other variables. Declared using the dereference operator (*), pointers provide low-level control over memory, allow efficient passing of large data structures by reference, and enable dynamic memory management via malloc(), calloc(), free() in C, or new/delete in C++. Understanding heap vs stack allocation prevents memory leaks, segmentation faults, and dangling pointer exploits.',
        importantConcepts: [
          'Address-of Operator (&): Retrieves the memory address of a variable',
          'Dereference Operator (*): Accesses the value residing at the stored address',
          'Heap vs Stack: Stack memory is automatic; Heap memory is allocated dynamically at runtime',
          'Pointer Arithmetic: ptr + 1 advances the pointer by sizeof(*ptr) bytes'
        ],
        examples: [
          {
            title: 'Dynamic Array Allocation in C++',
            problem: 'Allocate an integer array of size n on the heap, initialize values, and properly delete it.',
            solution: 'int* arr = new int[n];\\nfor(int i = 0; i < n; i++) arr[i] = (i + 1) * 10;\\n// free memory to prevent leak\\ndelete[] arr;\\narr = nullptr;'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'cpp',
          content: `int val = 100;
int* ptr = &val;       // ptr stores address of val
cout << *ptr << endl;  // prints 100

// Dynamic heap allocation
int* dyn = new int(250);
delete dyn;            // free memory
dyn = nullptr;         // neutralize dangling pointer`,
          caption: 'Pointer declaration, dereferencing, and safe deallocation in C++'
        },
        stepByStep: [
          { step: 1, title: 'Declaration', description: 'Specify data type followed by asterisk, e.g. int* p.' },
          { step: 2, title: 'Initialization', description: 'Assign address using &, e.g. p = &x; or allocate via new/malloc.' },
          { step: 3, title: 'Dereferencing', description: 'Use *p to read or update the value stored at that location.' },
          { step: 4, title: 'Cleanup', description: 'Always delete or free heap pointers and reset to nullptr.' }
        ],
        keyPoints: [
          'Uninitialized pointers point to random memory (wild pointers).',
          'Always set pointers to nullptr after deleting them to avoid dangling pointer bugs.'
        ],
        commonMistakes: [
          'Dereferencing a null or unallocated pointer (causes Segmentation Fault).',
          'Using delete instead of delete[] for dynamically allocated arrays.'
        ],
        quickRevision: [
          '& gets address; * gets value.',
          'new pairs with delete; new[] pairs with delete[].',
          'Always free heap allocations.'
        ],
        assessmentQuestions: [
          {
            id: 'q_prog1',
            question: 'Which operator is used to get the memory address of a variable in C/C++?',
            options: ['*', '&', '->', '%'],
            correctIndex: 1,
            explanation: 'The ampersand (&) is the address-of operator that returns the memory location of a variable.'
          },
          {
            id: 'q_prog2',
            question: 'What happens if you allocate memory with new in C++ and never call delete?',
            options: ['Stack overflow', 'Memory leak', 'Compile error', 'Garbage collection occurs'],
            correctIndex: 1,
            explanation: 'C++ does not have automatic garbage collection. Unreleased heap memory remains occupied, resulting in a memory leak.'
          }
        ]
      },
      {
        id: 'prog-bitwise',
        subjectId: 'programming',
        title: 'Bitwise Manipulation & Bitmasking',
        unitNumber: 2,
        unitTitle: 'Binary Operations & Embedded Registers',
        difficulty: 'Intermediate',
        estimatedMinutes: 35,
        referenceCitation: 'Ref: Henry S. Warren Jr. - Hacker\'s Delight, 2nd Ed., Ch. 2',
        simpleExplanation:
          'Bitwise operators work directly on the individual 0s and 1s inside a byte. It is like flipping microscopic light switches simultaneously, providing unmatched speed and memory efficiency.',
        detailedExplanation:
          'Computers execute bitwise operations (AND &, OR |, XOR ^, NOT ~, Left Shift <<, Right Shift >>) in a single CPU clock cycle. Bitmasking allows programmers to store 32 or 64 boolean flags in a single integer variable, query register flags in microcontrollers, compute fast powers of two, and build space-efficient cryptosystems and network packet parsers.',
        importantConcepts: [
          'Set bit: num | (1 << i)',
          'Clear bit: num & ~(1 << i)',
          'Toggle bit: num ^ (1 << i)',
          'Check bit: (num & (1 << i)) != 0',
          'Brian Kernighan’s Trick: n & (n - 1) clears the lowest set bit in O(set bits)'
        ],
        examples: [
          {
            title: 'Testing if an Integer is a Power of Two',
            problem: 'Write an O(1) expression to verify if integer n > 0 is a power of 2.',
            solution: 'bool isPowerOfTwo = (n > 0) && ((n & (n - 1)) == 0);\\nPowers of two have exactly one set bit (e.g. 8 = 1000₂). Subtracting 1 gives 7 (0111₂). Their bitwise AND is strictly 0.'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'cpp',
          content: `// Brian Kernighan's Algorithm for counting set bits
int countSetBits(int n) {
    int count = 0;
    while (n > 0) {
        n = n & (n - 1); // clears lowest set bit
        count++;
    }
    return count;
}`,
          caption: 'O(k) population count where k is the count of active bits'
        },
        stepByStep: [
          { step: 1, title: 'Create Mask', description: 'Shift 1 left by i positions to isolate bit i: mask = 1 << i.' },
          { step: 2, title: 'Apply Bitwise Operator', description: 'Use & to test, | to activate, or ^ to invert the targeted bit position.' },
          { step: 3, title: 'Check Result', description: 'Compare against 0 to test boolean state.' }
        ],
        keyPoints: [
          'Multiplying by 2ᵏ is equivalent to left shift: x << k.',
          'Dividing by 2ᵏ is equivalent to right shift: x >> k.'
        ],
        commonMistakes: [
          'Operator precedence: == has higher precedence than &, so always wrap in parentheses: (n & 1) == 0.',
          'Right shifting signed negative integers performs arithmetic shift (copies sign bit).'
        ],
        quickRevision: [
          'n & (n-1) drops lowest set bit.',
          'x ^ x = 0; x ^ 0 = x.',
          '1 << k = 2ᵏ.'
        ],
        assessmentQuestions: [
          {
            id: 'q_bit1',
            question: 'What is the outcome of the expression x ^ x for any integer x?',
            options: ['x', '1', '0', '-1'],
            correctIndex: 2,
            explanation: 'XOR yields 1 only when bits differ. Since all bits of x are identical to itself, every bit evaluates to 0.'
          }
        ]
      },
      {
        id: 'prog-recursion',
        subjectId: 'programming',
        title: 'Recursion, Call Stacks & Backtracking',
        unitNumber: 3,
        unitTitle: 'Algorithmic Paradigms & Stack Frames',
        difficulty: 'Intermediate',
        estimatedMinutes: 45,
        referenceCitation: 'Ref: Thomas H. Cormen et al. - Introduction to Algorithms (CLRS), 3rd Ed., Ch. 4',
        simpleExplanation:
          'Recursion is when a function solves a big puzzle by calling itself on smaller versions of the same puzzle, until it reaches a trivial base case that can be answered immediately.',
        detailedExplanation:
          'Recursive execution creates a chain of activation records (stack frames) in call stack memory, preserving local variables and return addresses. Backtracking extends recursion by systematically exploring decision state spaces (e.g. N-Queens, Sudoku, Maze pathfinding), abandoning partial paths (pruning) as soon as constraints are violated to avoid brute-force combinatorial explosions.',
        importantConcepts: [
          'Base Case: Mandatory termination condition that stops infinite recursion',
          'Recursive Step: Reduces problem size toward the base case',
          'Stack Overflow: Exceeding maximum call stack depth due to missing base case',
          'Tail Recursion: Recursive call as the final statement, enabling compiler optimization to O(1) space'
        ],
        examples: [
          {
            title: 'Tower of Hanoi Solution',
            problem: 'Move n disks from Source peg to Destination peg using Auxiliary peg.',
            solution: 'void hanoi(int n, char from, char to, char aux) {\\n    if (n == 0) return;\\n    hanoi(n - 1, from, aux, to);\\n    cout << "Move disk " << n << " from " << from << " to " << to << endl;\\n    hanoi(n - 1, aux, to, from);\\n}'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'cpp',
          content: `// Classic Backtracking: Subset Generation
void generateSubsets(vector<int>& nums, int index, vector<int>& current) {
    if (index == nums.size()) {
        // Process generated subset
        return;
    }
    // Choice 1: Include nums[index]
    current.push_back(nums[index]);
    generateSubsets(nums, index + 1, current);
    
    // Backtrack (undo choice)
    current.pop_back();
    
    // Choice 2: Exclude nums[index]
    generateSubsets(nums, index + 1, current);
}`,
          caption: 'Backtracking pattern: choose, explore, and un-choose'
        },
        stepByStep: [
          { step: 1, title: 'Identify Base Case', description: 'Define simplest inputs where answer is known without further recursion.' },
          { step: 2, title: 'Determine State Transition', description: 'Break larger problem instance f(n) into smaller subproblem calls.' },
          { step: 3, title: 'Backtrack State', description: 'Revert modified data structures so caller returns to a pristine state.' }
        ],
        keyPoints: [
          'Every recursive algorithm can be converted to an iterative one using an explicit stack.',
          'Time complexity often satisfies recurrence relations solved via Master Theorem.'
        ],
        commonMistakes: [
          'Omitting return statements in base cases, allowing execution to spill into recursive branches.',
          'Passing large collections by value instead of const reference in recursive parameters.'
        ],
        quickRevision: [
          'Always verify base condition.',
          'Call stack stores return addresses.',
          'Backtracking = DFS + State restoration.'
        ],
        assessmentQuestions: [
          {
            id: 'q_rec1',
            question: 'What condition causes a program to crash with a Stack Overflow error during recursion?',
            options: ['Heap memory exhausted', 'Missing or unreachable base case leading to unbounded call frames', 'Division by zero', 'Memory fragmentation'],
            correctIndex: 1,
            explanation: 'Without a proper base case, function calls stack indefinitely until the OS stack memory limit is exceeded.'
          }
        ]
      },
      {
        id: 'prog-structs',
        subjectId: 'programming',
        title: 'Structs, Memory Alignment & File I/O',
        unitNumber: 4,
        unitTitle: 'Data Representation & System Storage',
        difficulty: 'Beginner',
        estimatedMinutes: 40,
        referenceCitation: 'Ref: Stephen Prata - C Primer Plus, 6th Ed., Ch. 13-14',
        simpleExplanation:
          'A struct is a custom blueprint that packages different data types (like an employee name, ID, and salary) into one single package. Alignment ensures the CPU reads this package cleanly from RAM.',
        detailedExplanation:
          'Structures group heterogeneous data elements under a single contiguous memory block. Hardware memory controllers read RAM in multi-byte chunks (e.g. 4 or 8 bytes). To optimize bus transfer speeds, compilers insert padding bytes (structure alignment/padding) between fields. File stream I/O (fread, fwrite, fstream) enables serializing structured records to persistent non-volatile disks.',
        importantConcepts: [
          'Structure Padding: Unused bytes inserted between struct members for hardware alignment',
          'sizeof(struct): Always greater than or equal to sum of individual member sizes',
          'Binary vs Text I/O: Binary writes raw memory bytes directly; Text converts values to ASCII characters',
          'File Descriptors & Pointers: Tracks current byte offset in active file stream'
        ],
        examples: [
          {
            title: 'Memory Padding Calculation',
            problem: 'Find sizeof(Sample) where struct Sample { char c; int i; char d; }; on a 32-bit architecture.',
            solution:
              'char c (1 byte) + 3 bytes padding -> 4 bytes\\nint i (4 bytes) -> 4 bytes\\nchar d (1 byte) + 3 bytes padding -> 4 bytes\\nTotal size = 12 bytes (not 6 bytes).'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'cpp',
          content: `struct Student {
    int id;          // 4 bytes
    char grade;      // 1 byte (+3 padding)
    double gpa;      // 8 bytes
};                   // Total: 16 bytes

// Binary File Persistence
ofstream out("records.bin", ios::binary);
Student s1 = {101, 'A', 3.92};
out.write(reinterpret_cast<char*>(&s1), sizeof(Student));
out.close();`,
          caption: 'Struct declaration with binary serialization using reinterpret_cast'
        },
        stepByStep: [
          { step: 1, title: 'Declare Structure', description: 'Define struct blueprint with member fields ordered from largest to smallest to minimize padding.' },
          { step: 2, title: 'Instantiate Record', description: 'Initialize struct variables using aggregate initialization syntax.' },
          { step: 3, title: 'Stream to Disk', description: 'Open file stream in binary mode and write raw memory buffer with sizeof operator.' }
        ],
        keyPoints: [
          'Reordering struct members from largest to smallest minimizes padding overhead.',
          '#pragma pack(1) disables padding at the expense of CPU read penalties.'
        ],
        commonMistakes: [
          'Writing structs containing raw pointers to disk (saved addresses become invalid pointers on reload).',
          'Forgetting to close file handles, leading to buffer flush failures.'
        ],
        quickRevision: [
          'Compilers pad structs for CPU bus alignment.',
          'Never write pointers directly in binary file I/O.',
          'Reorder members to save RAM.'
        ],
        assessmentQuestions: [
          {
            id: 'q_str1',
            question: 'Why does the compiler insert padding bytes inside a C/C++ structure?',
            options: ['To encrypt data', 'To align data members with CPU word boundaries for faster memory access', 'To prevent buffer overflow', 'To satisfy ASCII encoding'],
            correctIndex: 1,
            explanation: 'Modern CPUs access memory most efficiently when n-byte primitives reside at memory addresses that are multiples of n.'
          }
        ]
      }
    ]
  },

  // ==========================================
  // 4. DATA STRUCTURES (CSE-201)
  // ==========================================
  {
    id: 'data-structures',
    title: 'Data Structures',
    code: 'CSE-201',
    department: 'Computer Science & Engineering',
    credits: 4,
    icon: '🌲',
    accent: '#10B981',
    accentLight: 'rgba(16, 185, 129, 0.12)',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    description: 'Binary search trees, AVL rotations, graph search algorithms, hash tables, heaps, and asymptotic algorithmic analysis.',
    topicsCount: 4,
    topics: [
      {
        id: 'dsa-bst',
        subjectId: 'data-structures',
        title: 'Binary Search Trees (BST) & AVL Trees',
        unitNumber: 1,
        unitTitle: 'Hierarchical Trees & Self-Balancing',
        difficulty: 'Intermediate',
        estimatedMinutes: 50,
        referenceCitation: 'Ref: Mark Allen Weiss - Data Structures and Algorithm Analysis in C++, 4th Ed., Ch. 4',
        simpleExplanation:
          'A Binary Search Tree is like an organized library: for every node, smaller numbers go to the left shelf, and larger numbers go to the right shelf. An AVL tree automatically balances itself so no branch gets too tall.',
        detailedExplanation:
          'A Binary Search Tree maintains the BST invariant: LeftSubtree < Node < RightSubtree, enabling average O(log n) search, insertion, and deletion. However, inserting sorted elements collapses the tree into an O(n) degenerate linked list. AVL trees prevent this by tracking a balance factor (Height(Left) - Height(Right) ∈ {-1, 0, 1}) and executing single (LL, RR) or double (LR, RL) rotations to guarantee strict O(log n) worst-case performance.',
        importantConcepts: [
          'BST Property: Left < Root < Right',
          'Inorder Traversal: Visits Left-Node-Right and always outputs keys in sorted order',
          'Balance Factor: BF = Height(LeftSubtree) - Height(RightSubtree)',
          'AVL Rotations: LL, RR (single rotations) and LR, RL (double rotations)'
        ],
        examples: [
          {
            title: 'Classifying AVL Rotation Type',
            problem: 'Node 30 has left child 20. Inserting 25 causes imbalance at node 30. Which rotation restores balance?',
            solution:
              'Node 25 is inserted into the right subtree of the left child (node 20).\\nThis is a Left-Right (LR) imbalance.\\nRestoring balance requires an LR Double Rotation: Left rotate around 20, then Right rotate around 30.'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'cpp',
          content: `// Right Rotation (RR case fix)
Node* rightRotate(Node* y) {
    Node* x = y->left;
    Node* T2 = x->right;
    
    // Perform rotation
    x->right = y;
    y->left = T2;
    
    // Update heights
    y->height = 1 + max(height(y->left), height(y->right));
    x->height = 1 + max(height(x->left), height(x->right));
    
    return x; // New root
}`,
          caption: 'AVL Tree single Right Rotation (Clockwise) implementation'
        },
        stepByStep: [
          { step: 1, title: 'Standard BST Insertion', description: 'Recursively locate insertion leaf based on key comparisons.' },
          { step: 2, title: 'Update Node Heights', description: 'Recalculate height values for ancestor nodes during recursion unwind.' },
          { step: 3, title: 'Compute Balance Factor', description: 'If |BF| > 1, determine which of the 4 rotation cases (LL, RR, LR, RL) applies.' },
          { step: 4, title: 'Apply Rotations', description: 'Re-link child pointers and update height metadata.' }
        ],
        keyPoints: [
          'Inorder traversal of any valid BST always yields ascending sorted keys.',
          'AVL trees are more strictly balanced than Red-Black trees, making lookups faster.'
        ],
        commonMistakes: [
          'Forgetting that every node in the entire left subtree must be less than the root, not just the immediate child.',
          'Failing to update height properties after rotating pointer connections.'
        ],
        quickRevision: [
          'Inorder = Sorted keys.',
          'AVL Balance Factor: {-1, 0, 1}.',
          'Worst case AVL search: O(log n).'
        ],
        assessmentQuestions: [
          {
            id: 'q_dsa1',
            question: 'Which traversal of a Binary Search Tree produces elements in strictly sorted ascending order?',
            options: ['Preorder', 'Inorder', 'Postorder', 'Level-order'],
            correctIndex: 1,
            explanation: 'Inorder traversal visits Left Subtree, Root, then Right Subtree, producing sorted output due to the BST invariant.'
          },
          {
            id: 'q_dsa2',
            question: 'What is the maximum allowed difference in subtree heights at any node in an AVL tree?',
            options: ['0', '1', '2', 'log n'],
            correctIndex: 1,
            explanation: 'By definition, an AVL tree requires the balance factor |h_left - h_right| to be at most 1.'
          }
        ]
      },
      {
        id: 'dsa-graphs',
        subjectId: 'data-structures',
        title: 'Graph Traversal: BFS, DFS & Dijkstra',
        unitNumber: 2,
        unitTitle: 'Non-Linear Graph Models & Shortest Paths',
        difficulty: 'Intermediate',
        estimatedMinutes: 50,
        referenceCitation: 'Ref: Cormen, Leiserson, Rivest, Stein - CLRS, 3rd Ed., Ch. 22 & 24',
        simpleExplanation:
          'A graph is a network of cities (vertices) connected by highways (edges). BFS explores outward in ripples like waves in a pond, while DFS charges down one rabbit hole as deep as possible before backtracking.',
        detailedExplanation:
          'Graphs G = (V, E) model networks of relationships. Breadth-First Search (BFS) uses a FIFO queue to discover vertices layer-by-layer, finding unweighted shortest paths in O(V + E). Depth-First Search (DFS) uses a LIFO stack/recursion to identify connected components, cycles, and topological orderings. Dijkstra\'s algorithm utilizes a min-priority queue to compute single-source shortest paths on non-negative weighted graphs in O((V + E) log V).',
        importantConcepts: [
          'Adjacency List vs Matrix: Lists use O(V + E) space; Matrices use O(V²) space',
          'BFS Queue vs DFS Stack: BFS guarantees shortest path in unweighted graphs',
          'Dijkstra Greedy Invariant: Greedily relaxes edges using min-heap priority',
          'Negative Edge Limitation: Dijkstra fails on negative edge weights (requires Bellman-Ford)'
        ],
        examples: [
          {
            title: 'Dijkstra Path Relaxation Step',
            problem: 'Distance to u is dist[u] = 10. Edge (u, v) has weight w = 4. Currently dist[v] = 18. Does dist[v] update?',
            solution:
              'Relaxation condition: if (dist[u] + w < dist[v])\\n10 + 4 = 14 < 18.\\nYes! dist[v] is relaxed to 14, and predecessor of v becomes u.'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'cpp',
          content: `// Dijkstra's Shortest Path Algorithm
void dijkstra(int src, vector<vector<pair<int,int>>>& adj, int V) {
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    vector<int> dist(V, 1e9);
    
    dist[src] = 0;
    pq.push({0, src}); // {distance, vertex}
    
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        
        for (auto [v, weight] : adj[u]) {
            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pq.push({dist[v], v});
            }
        }
    }
}`,
          caption: 'Dijkstra shortest path with STL min-heap priority queue'
        },
        stepByStep: [
          { step: 1, title: 'Initialize Distances', description: 'Set dist[src]=0 and all other dist[v]=∞. Push (0, src) to min-priority queue.' },
          { step: 2, title: 'Extract Min Vertex', description: 'Pop vertex u with smallest known distance.' },
          { step: 3, title: 'Edge Relaxation', description: 'For each neighbor v, if dist[u] + weight(u,v) < dist[v], update dist[v] and push into priority queue.' },
          { step: 4, title: 'Repeat until Empty', description: 'Continue until all reachable vertices are finalized.' }
        ],
        keyPoints: [
          'BFS finds shortest paths in unweighted graphs in O(V + E).',
          'Dijkstra assumes non-negative edge weights; negative cycles cause infinite loops.'
        ],
        commonMistakes: [
          'Using Dijkstra on graphs containing negative edge weights.',
          'Forgetting to mark nodes visited in BFS/DFS, causing infinite loops in cyclic graphs.'
        ],
        quickRevision: [
          'BFS -> Queue (FIFO).',
          'DFS -> Stack/Recursion (LIFO).',
          'Dijkstra -> Min-Heap (Greedy).'
        ],
        assessmentQuestions: [
          {
            id: 'q_grp1',
            question: 'Why does Dijkstra’s algorithm fail on graphs with negative edge weights?',
            options: ['It causes compiler errors', 'The greedy choice assumption that a visited node’s distance is optimal is broken by negative edges', 'Queue runs out of memory', 'Time complexity becomes O(1)'],
            correctIndex: 1,
            explanation: 'Dijkstra permanently marks a vertex finalized once popped from the priority queue. A negative edge encountered later could produce a shorter path to an already finalized vertex.'
          }
        ]
      },
      {
        id: 'dsa-hashing',
        subjectId: 'data-structures',
        title: 'Hash Tables, Collisions & Load Factors',
        unitNumber: 3,
        unitTitle: 'Associative Arrays & Constant-Time Lookups',
        difficulty: 'Beginner',
        estimatedMinutes: 40,
        referenceCitation: 'Ref: Robert Sedgewick - Algorithms in C++, Parts 1-4, Ch. 14',
        simpleExplanation:
          'A hash table is like a coat check at a theater: your name is run through a quick formula that tells the attendant the exact hanger number where your coat hangs, giving instant retrieval.',
        detailedExplanation:
          'Hash tables map arbitrary keys to integer array indices using a hash function h(k). They offer average O(1) time complexity for insert, search, and delete. When two distinct keys hash to the same bucket (collision), resolution strategies include Chaining (linked lists or balanced trees per bucket) or Open Addressing (Linear Probing, Quadratic Probing, Double Hashing). Resizing occurs when the load factor α = n/m exceeds a threshold.',
        importantConcepts: [
          'Hash Function: Deterministic, uniform distribution across m buckets',
          'Load Factor: α = n / m (number of elements divided by table capacity)',
          'Separate Chaining: Buckets store linked lists; graceful degradation under high load',
          'Open Addressing & Tombstones: Collisions probe next slot; deletions require special "deleted" marker'
        ],
        examples: [
          {
            title: 'Linear Probing Insertion',
            problem: 'Hash table size m=7, h(k) = k mod 7. Keys 14, 21, and 28 are inserted. Where do they land?',
            solution:
              '14 mod 7 = 0 -> Slot [0]\\n21 mod 7 = 0 -> Collision at [0]! Probe to [1] -> Slot [1]\\n28 mod 7 = 0 -> Collision at [0] and [1]! Probe to [2] -> Slot [2].'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'cpp',
          content: `// Separate Chaining Hash Map Skeleton
class HashTable {
    int BUCKET;
    vector<list<pair<string, int>>> table;
public:
    HashTable(int b) : BUCKET(b), table(b) {}
    
    int hashFunction(string key) {
        int hash = 0;
        for (char c : key) hash = (hash * 31 + c) % BUCKET;
        return hash;
    }
    
    void insert(string key, int val) {
        int idx = hashFunction(key);
        table[idx].push_back({key, val});
    }
};`,
          caption: 'Hash table implementation with polynomial rolling hash and separate chaining'
        },
        stepByStep: [
          { step: 1, title: 'Compute Hash Code', description: 'Convert key into a large integer using hash function.' },
          { step: 2, title: 'Compress to Index', description: 'Modulo the hash code by table capacity: index = hash % capacity.' },
          { step: 3, title: 'Resolve Collision', description: 'Append to bucket linked list or probe sequentially until an empty slot is found.' }
        ],
        keyPoints: [
          'Average search time is O(1); worst case is O(n) if all keys hash to the identical bucket.',
          'Java HashMap converts linked list chains to Red-Black trees when bucket length exceeds 8.'
        ],
        commonMistakes: [
          'Using a mutable object as a hash key without updating its hashCode.',
          'Linear probing primary clustering: clusters grow larger as collision chains merge.'
        ],
        quickRevision: [
          'Load factor α = n/m.',
          'Chaining uses lists.',
          'Open addressing probes array.',
          'Average O(1), Worst O(n).'
        ],
        assessmentQuestions: [
          {
            id: 'q_hsh1',
            question: 'What is the primary purpose of resizing and rehashing a hash table when the load factor exceeds 0.75?',
            options: ['To save disk space', 'To prevent long collision chains and maintain average O(1) performance', 'To sort elements in ascending order', 'To enforce encryption'],
            correctIndex: 1,
            explanation: 'As the load factor increases, collisions multiply exponentially. Resizing doubles capacity and rehashes items, restoring O(1) lookup efficiency.'
          }
        ]
      },
      {
        id: 'dsa-heaps',
        subjectId: 'data-structures',
        title: 'Binary Heaps & Priority Queues',
        unitNumber: 4,
        unitTitle: 'Array-Based Heaps & Priority Schedulers',
        difficulty: 'Intermediate',
        estimatedMinutes: 45,
        referenceCitation: 'Ref: Cormen et al. - CLRS, 3rd Ed., Ch. 6 (Heapsort)',
        simpleExplanation:
          'A heap is an emergency room triage system: patients are admitted continuously, but the doctor always sees the most critically ill patient first, regardless of when they arrived.',
        detailedExplanation:
          'A Binary Heap is a complete binary tree represented compactly in a single contiguous array without pointers. In a Max-Heap, every parent node is greater than or equal to its children (A[parent] ≥ A[child]). Insertion operates via bubble-up in O(log n), and extracting the maximum root operates via heapify-down in O(log n). Building a heap from an unordered array of n elements takes linear O(n) time.',
        importantConcepts: [
          'Array Indexing Formulas: Left child = 2i + 1, Right child = 2i + 2, Parent = (i - 1) / 2',
          'Heapify Operation: Sifts down an out-of-order element to restore the heap property in O(log n)',
          'Build-Heap Complexity: Mathematically bounded by O(n) due to sum of series ∑ (h / 2ʰ)',
          'Heapsort: In-place comparison sort with guaranteed O(n log n) time and O(1) auxiliary space'
        ],
        examples: [
          {
            title: 'Locating Children in Heap Array',
            problem: 'In a 0-indexed heap array, element 50 resides at index i = 3. What are its children\'s indices?',
            solution:
              'Left child index = 2(3) + 1 = 7.\\nRight child index = 2(3) + 2 = 8.\\nParent index = (3 - 1) / 2 = 1.'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'cpp',
          content: `// Max-Heapify sift-down function
void maxHeapify(vector<int>& arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    
    if (largest != i) {
        swap(arr[i], arr[largest]);
        maxHeapify(arr, n, largest); // Recurse on affected branch
    }
}`,
          caption: 'Max-Heapify sift-down algorithm restoring heap invariant'
        },
        stepByStep: [
          { step: 1, title: 'Insert at Leaf', description: 'Append new element to end of array to preserve the complete binary tree structure.' },
          { step: 2, title: 'Bubble Up', description: 'Compare with parent; if child > parent in max-heap, swap and continue up to root.' },
          { step: 3, title: 'Extract Max', description: 'Swap root with last leaf, decrement heap size, and invoke heapify on new root.' }
        ],
        keyPoints: [
          'Heaps are stored in contiguous arrays without pointer overhead.',
          'Heapsort runs in O(n log n) worst-case time without requiring extra memory like Mergesort.'
        ],
        commonMistakes: [
          'Confusing a binary heap with a binary search tree (a heap does NOT preserve sorted order between left and right siblings).',
          'Assuming building a heap takes O(n log n) when it actually runs in optimal O(n).'
        ],
        quickRevision: [
          'Parent = (i-1)/2.',
          'Children = 2i+1, 2i+2.',
          'Build heap = O(n).',
          'Extract-max = O(log n).'
        ],
        assessmentQuestions: [
          {
            id: 'q_heap1',
            question: 'What is the time complexity required to construct a binary heap from an unsorted array of n elements?',
            options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
            correctIndex: 2,
            explanation: 'Using the bottom-up build-heap procedure, nodes at higher levels have shorter sift-down paths, yielding a convergent series bounded by O(n).'
          }
        ]
      }
    ]
  },

  // ==========================================
  // 5. JAVA (CSE-205)
  // ==========================================
  {
    id: 'java',
    title: 'Java',
    code: 'CSE-205',
    department: 'Software Engineering & Enterprise Systems',
    credits: 4,
    icon: '☕',
    accent: '#EA580C',
    accentLight: 'rgba(234, 88, 12, 0.12)',
    badgeColor: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    description: 'OOP polymorphism, JVM internals, garbage collection tuning, Java collections, generics, and concurrent thread management.',
    topicsCount: 4,
    topics: [
      {
        id: 'java-oop',
        subjectId: 'java',
        title: 'Core OOP: Polymorphism & Interfaces',
        unitNumber: 1,
        unitTitle: 'Object-Oriented Design & Contracts',
        difficulty: 'Beginner',
        estimatedMinutes: 40,
        referenceCitation: 'Ref: Joshua Bloch - Effective Java, 3rd Ed., Items 18-22',
        simpleExplanation:
          'Polymorphism means "many forms". A parent can have an instruction like "speak()", but a dog says "bark" and a cat says "meow". The same method call behaves differently depending on the object.',
        detailedExplanation:
          'Java implements Object-Oriented Programming through Encapsulation, Abstraction, Inheritance, and Polymorphism. Polymorphism exists in two forms: Compile-time (Method Overloading) and Runtime (Method Overriding via dynamic method dispatch). Interfaces establish contracts that unrelated classes can implement, enabling multiple inheritance of type and decoupled architectural designs.',
        importantConcepts: [
          'Method Overriding: Subclass provides a specific implementation of a parent class method',
          'Dynamic Method Dispatch: JVM resolves method call at runtime based on the actual object instance',
          'Interface: Abstract type specifying method signatures without state',
          'Default Methods: Interfaces can define backward-compatible concrete implementations using default keyword'
        ],
        examples: [
          {
            title: 'Runtime Polymorphism with Shape Interface',
            problem: 'Create a Shape interface and implement Circle and Rectangle with different area calculations.',
            solution: 'interface Shape { double getArea(); }\\nclass Circle implements Shape { double r; Circle(double r){this.r=r;} public double getArea(){ return Math.PI*r*r; } }\\nShape s = new Circle(5); // Dynamic dispatch resolves Circle::getArea'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'java',
          content: `interface PaymentService {
    void process(double amount);
}

class UPIPayment implements PaymentService {
    @Override
    public void process(double amount) {
        System.out.println("Processing ₹" + amount + " via UPI gateway.");
    }
}

// Client code decoupled from implementation
PaymentService service = new UPIPayment();
service.process(1500.0);`,
          caption: 'Interface Implementation and Method Overriding'
        },
        stepByStep: [
          { step: 1, title: 'Define Interface', description: 'Use the interface keyword to define reusable behavioral contracts.' },
          { step: 2, title: 'Implement Contract', description: 'Concrete classes use the implements keyword and override methods.' },
          { step: 3, title: 'Reference via Interface', description: 'Declare reference variables using the interface type for decoupling.' }
        ],
        keyPoints: [
          'Static methods and private methods cannot be overridden.',
          'The @Override annotation ensures compiler verification of method signatures.'
        ],
        commonMistakes: [
          'Changing parameter list when attempting to override (results in method overloading instead).',
          'Instantiating an interface directly with new without an anonymous class.'
        ],
        quickRevision: [
          'Overloading = Compile-time.',
          'Overriding = Runtime.',
          '@Override catches signature errors.'
        ],
        assessmentQuestions: [
          {
            id: 'q_jav1',
            question: 'What mechanism does the Java Virtual Machine use to resolve which overridden method to execute at runtime?',
            options: ['Static Binding', 'Dynamic Method Dispatch', 'Garbage Collector', 'Bytecode Verifier'],
            correctIndex: 1,
            explanation: 'Dynamic method dispatch checks the vtable of the runtime object instance at execution time to invoke the correct overridden implementation.'
          }
        ]
      },
      {
        id: 'java-jvm',
        subjectId: 'java',
        title: 'JVM Architecture & Garbage Collection',
        unitNumber: 2,
        unitTitle: 'Virtual Machine Internals & Memory Layout',
        difficulty: 'Advanced',
        estimatedMinutes: 50,
        referenceCitation: 'Ref: Bill Venners - Inside the Java Virtual Machine, 2nd Ed., Ch. 5',
        simpleExplanation:
          'When Java runs, the JVM manages memory for you. You create objects on the heap, and an automated cleaner (the Garbage Collector) hunts down abandoned objects and recycles their memory back to the OS.',
        detailedExplanation:
          'The JVM executes compiled .class bytecode through ClassLoaders, the Execution Engine (JIT Compiler + Interpreter), and Runtime Data Areas. Memory is split into Method Area (Metaspace), Heap (Eden, Survivor, Tenured/Old Gen), Java Thread Stacks, and PC Registers. Garbage Collection algorithms (G1GC, ZGC) reclaim unreferenced memory using root reachability analysis, traversing references from GC Roots.',
        importantConcepts: [
          'JVM Memory Areas: Stack (local primitives and frames), Heap (all instantiated objects)',
          'Generational Hypothesis: Most allocated objects die shortly after creation in Young Gen (Eden)',
          'GC Roots: Stack frame variables, static class variables, and JNI handles',
          'Stop-the-World (STW): Pauses where application threads suspend while GC reconciles live references'
        ],
        examples: [
          {
            title: 'Object Lifecycle across Generations',
            problem: 'How does an object created via new Employee() transition through heap memory?',
            solution:
              '1. Allocated in Eden Space (Young Generation).\\n2. If it survives a Minor GC, moved to Survivor Space (S0/S1) with age incremented.\\n3. If it survives multiple cycles (tenuring threshold, default 15), promoted to Old (Tenured) Generation.'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'java',
          content: `// Demonstrating GC eligible object
public class MemoryDemo {
    public static void main(String[] args) {
        String data = new String("Temporary Report Data");
        // data is reachable via GC Root (main thread stack frame)
        
        data = null; 
        // Original string object is now unreferenced and eligible for GC!
    }
}`,
          caption: 'Dereferencing an object to make it eligible for Garbage Collection'
        },
        stepByStep: [
          { step: 1, title: 'Class Loading', description: 'ClassLoader loads bytecode, verifies bytecode safety, and allocates static fields in Metaspace.' },
          { step: 2, title: 'Memory Allocation', description: 'Objects allocated on Eden heap; references stored on thread stack.' },
          { step: 3, title: 'Mark and Sweep', description: 'GC identifies reachable objects from GC Roots and sweeps dead unreferenced memory.' }
        ],
        keyPoints: [
          'Stack memory is thread-safe and deallocated automatically upon function return.',
          'System.gc() is merely a suggestion to the JVM; execution is never guaranteed.'
        ],
        commonMistakes: [
          'Holding references in static collections (causes memory leaks in Java).',
          'Assuming finalizer methods guarantee timely resource cleanup (use try-with-resources instead).'
        ],
        quickRevision: [
          'Stack = Primitives & References.',
          'Heap = Objects.',
          'Young Gen -> Old Gen.',
          'G1GC default in modern Java.'
        ],
        assessmentQuestions: [
          {
            id: 'q_jvm1',
            question: 'Which area of the JVM runtime data is private to each execution thread and never shared across threads?',
            options: ['Heap', 'Metaspace', 'Java Thread Stack', 'Method Area'],
            correctIndex: 2,
            explanation: 'Each thread possesses its own private Call Stack created upon thread startup. The Heap is shared across all threads.'
          }
        ]
      },
      {
        id: 'java-collections',
        subjectId: 'java',
        title: 'Java Collections Framework & Generics',
        unitNumber: 3,
        unitTitle: 'Containers, Type Safety & Stream Pipelines',
        difficulty: 'Intermediate',
        estimatedMinutes: 45,
        referenceCitation: 'Ref: Cay S. Horstmann - Core Java Volume I, 12th Ed., Ch. 8 & 9',
        simpleExplanation:
          'Collections are ready-made containers like dynamic lists, unique sets, and key-value maps. Generics ensure that if you make a box for Apples, the compiler will stop you from accidentally dropping in an Orange.',
        detailedExplanation:
          'The Java Collections Framework standardizes data structures under Collection (List, Set, Queue) and Map hierarchies. ArrayList provides O(1) random index access with dynamic array doubling; LinkedList provides O(1) insertions at ends; HashSet and HashMap provide amortized O(1) key-value access. Generics enforce compile-time type safety via Type Erasure, preventing runtime ClassCastExceptions.',
        importantConcepts: [
          'List vs Set vs Map: Lists permit duplicates; Sets enforce uniqueness; Maps store key-value pairs',
          'equals() and hashCode() Contract: If two objects are equal according to equals(), their hashCodes MUST be identical',
          'Type Erasure: Java compiler replaces all generic type parameters with Object or bounds at compile-time',
          'Streams API: Declarative, functional transformations (map, filter, reduce) over collections'
        ],
        examples: [
          {
            title: 'Stream API Filtering and Transformation',
            problem: 'Filter names starting with "S", convert to uppercase, and collect to a List.',
            solution: 'List<String> names = List.of("Surya", "Rahul", "Sadhana", "Anand");\\nList<String> result = names.stream()\\n    .filter(n -> n.startsWith("S"))\\n    .map(String::toUpperCase)\\n    .collect(Collectors.toList());\\n// result: ["SURYA", "SADHANA"]'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'java',
          content: `// Generic Cache with HashMap
public class Cache<K, V> {
    private final Map<K, V> store = new ConcurrentHashMap<>();
    
    public void put(K key, V value) {
        store.put(key, value);
    }
    
    public V get(K key) {
        return store.get(key);
    }
}`,
          caption: 'Type-safe generic cache leveraging ConcurrentHashMap'
        },
        stepByStep: [
          { step: 1, title: 'Choose Collection Type', description: 'Select List for ordered sequences, Set for uniqueness, or Map for dictionary lookups.' },
          { step: 2, title: 'Specify Generic Bounds', description: 'Use generic syntax <T> or wildcards <? extends Number> for type safety.' },
          { step: 3, title: 'Implement equals/hashCode', description: 'Override both methods whenever custom classes serve as HashSet elements or HashMap keys.' }
        ],
        keyPoints: [
          'Failing the equals/hashCode contract causes HashMap lookup failures.',
          'ArrayList is faster for lookups; LinkedList has heavy pointer memory overhead.'
        ],
        commonMistakes: [
          'Overriding equals() without overriding hashCode().',
          'Modifying a collection while iterating with a for-each loop (throws ConcurrentModificationException).'
        ],
        quickRevision: [
          'ArrayList = Dynamic array.',
          'HashMap = O(1) avg lookup.',
          'equals() requires matching hashCode().'
        ],
        assessmentQuestions: [
          {
            id: 'q_col1',
            question: 'What runtime exception occurs if you modify a collection directly while iterating over it with an Iterator?',
            options: ['NullPointerException', 'ConcurrentModificationException', 'ClassCastException', 'IllegalStateException'],
            correctIndex: 1,
            explanation: 'Fail-fast iterators detect modification count changes (modCount mismatch) and immediately throw ConcurrentModificationException.'
          }
        ]
      },
      {
        id: 'java-concurrency',
        subjectId: 'java',
        title: 'Multithreading, Concurrency & Synchronization',
        unitNumber: 4,
        unitTitle: 'Parallel Computing & Thread Safety',
        difficulty: 'Advanced',
        estimatedMinutes: 50,
        referenceCitation: 'Ref: Brian Goetz - Java Concurrency in Practice, Ch. 2 & 3',
        simpleExplanation:
          'Multithreading is like multiple chefs cooking in the same kitchen. If two chefs reach for the spice jar at the exact same millisecond, they will collide: synchronization is the rulebook that prevents collisions.',
        detailedExplanation:
          'Java supports native multi-threaded execution through the Thread class, Runnable, and Callable interfaces. Concurrency introduces race conditions, deadlocks, and visibility bugs across CPU cores. Thread synchronization is achieved via the synchronized keyword (monitors), volatile (memory visibility without caching), explicit ReentrantLocks, and atomic primitives (AtomicInteger) based on Compare-And-Swap (CAS).',
        importantConcepts: [
          'Race Condition: Occurs when multiple threads mutate shared mutable state without proper locking',
          'volatile Keyword: Ensures reads and writes go directly to main memory, establishing happens-before guarantees',
          'Deadlock: Condition where thread A holds Lock 1 and waits for Lock 2, while thread B holds Lock 2 and waits for Lock 1',
          'ExecutorService: Thread pool abstraction avoiding high overhead of manual thread creation'
        ],
        examples: [
          {
            title: 'Atomic Thread-Safe Counter',
            problem: 'Increment a counter from 10 concurrent threads without using synchronized blocks.',
            solution: 'AtomicInteger count = new AtomicInteger(0);\\n// In thread task:\\ncount.incrementAndGet(); // Non-blocking hardware-level atomic CAS increment'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'java',
          content: `// Safe Thread-Safe Singleton with Double-Checked Locking
public class SafeService {
    private static volatile SafeService instance;
    
    private SafeService() {}
    
    public static SafeService getInstance() {
        if (instance == null) {
            synchronized (SafeService.class) {
                if (instance == null) {
                    instance = new SafeService();
                }
            }
        }
        return instance;
    }
}`,
          caption: 'Double-Checked Locking with volatile keyword for thread-safe lazy instantiation'
        },
        stepByStep: [
          { step: 1, title: 'Identify Shared Mutable State', description: 'Locate variables accessed and written by more than one thread.' },
          { step: 2, title: 'Choose Concurrency Primitive', description: 'Use Atomic primitives for single variables; synchronized/Lock for multi-step compound actions.' },
          { step: 3, title: 'Manage Thread Lifecycle', description: 'Submit tasks to Executors.newFixedThreadPool() instead of spawning raw threads.' }
        ],
        keyPoints: [
          'volatile guarantees visibility, but does NOT guarantee atomicity for compound operations like count++.',
          'Deadlocks are prevented by enforcing a global, uniform lock acquisition order.'
        ],
        commonMistakes: [
          'Calling run() instead of start() (calling run() executes synchronously on the current caller thread!).',
          'Assuming count++ is atomic (it consists of 3 distinct bytecode instructions: read, modify, write).'
        ],
        quickRevision: [
          'start() spawns thread; run() does not.',
          'volatile = visibility.',
          'AtomicInteger uses hardware CAS.',
          'Use ExecutorService pools.'
        ],
        assessmentQuestions: [
          {
            id: 'q_con1',
            question: 'What happens if you invoke thread.run() instead of thread.start() in Java?',
            options: ['The thread starts in background', 'The run() method executes synchronously on the calling thread without spawning a new thread', 'A compilation error is thrown', 'JVM enters deadlock'],
            correctIndex: 1,
            explanation: 'thread.start() requests the OS kernel to spawn a new native thread; invoking run() simply calls the method as a normal synchronous function call.'
          }
        ]
      }
    ]
  },

  // ==========================================
  // 6. PYTHON (CSE-208)
  // ==========================================
  {
    id: 'python',
    title: 'Python',
    code: 'CSE-208',
    department: 'Computer Science & Software Development',
    credits: 3,
    icon: '🐍',
    accent: '#0284C7',
    accentLight: 'rgba(2, 132, 199, 0.12)',
    badgeColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    description: 'Pythonic idioms, generator memory pipelines, decorators, closures, magic dunder methods, asyncio, and the GIL.',
    topicsCount: 4,
    topics: [
      {
        id: 'py-comprehensions',
        subjectId: 'python',
        title: 'Comprehensions, Generators & Iterators',
        unitNumber: 1,
        unitTitle: 'Pythonic Data Pipelines & Memory Efficiency',
        difficulty: 'Beginner',
        estimatedMinutes: 35,
        referenceCitation: 'Ref: Luciano Ramalho - Fluent Python, 2nd Ed., Ch. 17',
        simpleExplanation:
          'A list comprehension builds a full grocery cart of items in memory right away. A generator is like a vending machine: it yields items one at a time only when you press the button, saving huge amounts of RAM.',
        detailedExplanation:
          'List, set, and dictionary comprehensions provide clean, concise syntax for creating collections. While a list comprehension stores all computed elements in memory at once, a generator expression or generator function (using the yield keyword) returns an iterator that computes values lazily on-demand. This transforms O(n) memory consumption into O(1) constant space when streaming gigabyte-sized files or infinite sequences.',
        importantConcepts: [
          'List Comprehension: [expr for item in iterable if condition]',
          'Lazy Evaluation: Calculations deferred until __next__() is invoked',
          'yield Keyword: Pauses function execution, preserving local frame state across calls',
          'Iterator Protocol: Objects implementing __iter__() and __next__()'
        ],
        examples: [
          {
            title: 'Memory Difference: List vs Generator',
            problem: 'Sum the squares of numbers from 1 to 1,000,000 without filling RAM.',
            solution: '# Generator expression uses O(1) memory!\\ntotal = sum(x * x for x in range(1_000_000))\\n# Unlike [x * x for x in range(...)], no 1M-element list is created in RAM.'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'python',
          content: `# Generator streaming large log files line by line
def stream_error_logs(filepath):
    with open(filepath, 'r') as file:
        for line in file:
            if 'ERROR' in line:
                yield line.strip()

# Consuming on-demand
for err in stream_error_logs('production.log'):
    print(f"Alert: {err}")`,
          caption: 'Lazy log stream generator with zero full-file memory footprint'
        },
        stepByStep: [
          { step: 1, title: 'Write Generation Logic', description: 'Define function with loops and yield statements instead of accumulating to a list.' },
          { step: 2, title: 'Instantiate Generator', description: 'Calling the generator returns an iterable generator object.' },
          { step: 3, title: 'Iterate Lazily', description: 'Loop with for or pass directly into streaming functions like sum(), min(), max().' }
        ],
        keyPoints: [
          'Generators can only be consumed once; recreate the generator to iterate again.',
          'Use parentheses () instead of brackets [] for generator expressions.'
        ],
        commonMistakes: [
          'Using list comprehensions on massive datasets, exhausting system RAM.',
          'Attempting to index a generator (e.g. gen[0] throws TypeError: object is not subscriptable).'
        ],
        quickRevision: [
          '[] = List (Eager).',
          '() = Generator (Lazy).',
          'yield produces one item and suspends.',
          'Memory is O(1).'
        ],
        assessmentQuestions: [
          {
            id: 'q_py1',
            question: 'What is the primary memory advantage of using a generator expression over a list comprehension in Python?',
            options: ['Generators run on the GPU', 'Generators compute values lazily on-demand, consuming O(1) space instead of holding all elements in RAM', 'Generators compile to C automatically', 'Generators bypass Python syntax checks'],
            correctIndex: 1,
            explanation: 'Generators yield one element at a time using iterator protocols, preventing memory allocation for the entire sequence.'
          }
        ]
      },
      {
        id: 'py-decorators',
        subjectId: 'python',
        title: 'Decorators, Closures & First-Class Functions',
        unitNumber: 2,
        unitTitle: 'Higher-Order Functions & Metaprogramming',
        difficulty: 'Intermediate',
        estimatedMinutes: 40,
        referenceCitation: 'Ref: Brett Slatkin - Effective Python, 2nd Ed., Item 26',
        simpleExplanation:
          'A decorator is gift wrap around a function: it lets you add extra superpowers (like timing how fast it runs or checking passwords) before and after the function executes, without changing the function code itself.',
        detailedExplanation:
          'Functions in Python are first-class citizens: they can be passed as arguments, returned from other functions, and bound to variables. A closure is an inner function that retains access to variables from its enclosing lexical scope even after the outer function has completed. A decorator wraps another function using the @decorator syntax, implementing cross-cutting concerns like logging, authentication, caching, and rate-limiting.',
        importantConcepts: [
          'First-Class Functions: Functions can be assigned, passed, and returned like integers or strings',
          'Closure: Inner function enclosing outer scope variables via __closure__ cell attribute',
          'functools.wraps: Preserves original function name and docstrings when wrapped',
          'Decorators with Arguments: Triple-nested functions returning a parameterized decorator'
        ],
        examples: [
          {
            title: 'Execution Timer Decorator',
            problem: 'Create a decorator that logs how many milliseconds a function took to execute.',
            solution: 'import time, functools\\ndef timer(func):\\n    @functools.wraps(func)\\n    def wrapper(*args, **kwargs):\\n        start = time.perf_counter()\\n        result = func(*args, **kwargs)\\n        print(f"{func.__name__} took {(time.perf_counter() - start)*1000:.2f}ms")\\n        return result\\n    return wrapper'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'python',
          content: `import functools

def require_auth(func):
    @functools.wraps(func)
    def wrapper(user, *args, **kwargs):
        if not user.get('authenticated'):
            raise PermissionError("User not authorized!")
        return func(user, *args, **kwargs)
    return wrapper

@require_auth
def view_grades(user):
    return "All Grades: Verified A+"`,
          caption: 'Authentication decorator preserving function metadata with @functools.wraps'
        },
        stepByStep: [
          { step: 1, title: 'Define Outer Decorator', description: 'Accept the target function as parameter func.' },
          { step: 2, title: 'Construct Wrapper', description: 'Define inner function with (*args, **kwargs) and decorate with @functools.wraps(func).' },
          { step: 3, title: 'Add Pre/Post Logic', description: 'Execute setup logic, invoke func(*args, **kwargs), execute cleanup, and return result.' },
          { step: 4, title: 'Return Wrapper', description: 'Return wrapper function object from outer decorator.' }
        ],
        keyPoints: [
          '@my_dec above def foo() is syntactic sugar for foo = my_dec(foo).',
          'Always use @functools.wraps(func) to prevent losing __name__ and docstrings.'
        ],
        commonMistakes: [
          'Forgetting to return the function’s result from inside the wrapper.',
          'Not using *args and **kwargs, restricting decorator to specific argument signatures.'
        ],
        quickRevision: [
          '@dec means fn = dec(fn).',
          'Closures preserve outer variables.',
          'Use functools.wraps.',
          'Return wrapper.'
        ],
        assessmentQuestions: [
          {
            id: 'q_dec1',
            question: 'What does the @my_decorator syntax directly desugar to in Python?',
            options: ['my_decorator.apply(func)', 'func = my_decorator(func)', 'import my_decorator', 'compile(func)'],
            correctIndex: 1,
            explanation: 'The @ syntax is syntactic sugar that passes the decorated function to the decorator callable and rebinds the function name to the returned wrapper.'
          }
        ]
      },
      {
        id: 'py-dunder',
        subjectId: 'python',
        title: 'Object Data Model & Dunder Methods',
        unitNumber: 3,
        unitTitle: 'Python Data Model & Operator Overloading',
        difficulty: 'Intermediate',
        estimatedMinutes: 40,
        referenceCitation: 'Ref: Luciano Ramalho - Fluent Python, Ch. 1 (The Python Data Model)',
        simpleExplanation:
          'Dunder (double underscore) methods like __init__ or __str__ are secret hooks: they tell Python how your custom object should react when someone types len(obj), obj1 + obj2, or print(obj).',
        detailedExplanation:
          'The Python Data Model defines a unified set of special methods (dunder methods: __init__, __repr__, __len__, __getitem__, __eq__, __add__) that allow user-defined classes to interact seamlessly with language constructs. By implementing these protocols, custom classes gain Pythonic operator overloading, iteration support, indexing, and context manager capabilities (with statement via __enter__ and __exit__).',
        importantConcepts: [
          'String Representation: __repr__ for unambiguous debugging; __str__ for human readability',
          'Sequence Protocol: Implementing __len__ and __getitem__ automatically enables slicing and for loops',
          'Context Managers: __enter__ and __exit__ guarantee deterministic cleanup (e.g. closing files or DB connections)',
          'Operator Overloading: __add__ for +, __mul__ for *, __eq__ for =='
        ],
        examples: [
          {
            title: 'Vector Arithmetic via Dunder Methods',
            problem: 'Create a 2D Vector class where v1 + v2 returns a new Vector with summed components.',
            solution: 'class Vector:\\n    def __init__(self, x, y):\\n        self.x, self.y = x, y\\n    def __add__(self, other):\\n        return Vector(self.x + other.x, self.y + other.y)\\n    def __repr__(self):\\n        return f"Vector({self.x}, {self.y})"\\n# v1 + v2 cleanly invokes v1.__add__(v2)'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'python',
          content: `class CustomResource:
    def __init__(self, name):
        self.name = name
        
    def __enter__(self):
        print(f"Allocating {self.name}")
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f"Safely deallocating {self.name}")
        return False # propagate exceptions if any

# Guaranteed cleanup
with CustomResource("GPU_Pipeline") as res:
    print("Processing deep learning tensors...")`,
          caption: 'Custom context manager implementing __enter__ and __exit__ protocol'
        },
        stepByStep: [
          { step: 1, title: 'Choose Protocol', description: 'Select the dunder methods corresponding to desired Python behavior.' },
          { step: 2, title: 'Implement Methods', description: 'Write standard implementations following Python conventions.' },
          { step: 3, title: 'Test with Built-ins', description: 'Verify using standard functions like len(), repr(), or operators like +.' }
        ],
        keyPoints: [
          'If __str__ is missing, Python falls back to __repr__ automatically.',
          'Implementing __getitem__ alone is sufficient to make an object iterable.'
        ],
        commonMistakes: [
          'Directly calling obj.__len__() instead of Pythonic len(obj).',
          'Forgetting to accept exception parameters (exc_type, exc_val, exc_tb) in __exit__.'
        ],
        quickRevision: [
          '__repr__ = Developer debug.',
          '__str__ = User view.',
          '__enter__ & __exit__ = with statement.',
          '__getitem__ = indexing.'
        ],
        assessmentQuestions: [
          {
            id: 'q_dun1',
            question: 'Which special dunder method is executed when exiting a with statement block?',
            options: ['__del__', '__close__', '__exit__', '__stop__'],
            correctIndex: 2,
            explanation: 'The context manager protocol calls __enter__ when entering the with block and guarantees calling __exit__ upon exiting, even if an exception was raised.'
          }
        ]
      },
      {
        id: 'py-async',
        subjectId: 'python',
        title: 'Asynchronous Programming: Asyncio & GIL',
        unitNumber: 4,
        unitTitle: 'Event Loops & Concurrency Limits',
        difficulty: 'Advanced',
        estimatedMinutes: 50,
        referenceCitation: 'Ref: Caleb Hattingh - Using Asyncio in Python, Ch. 1 & 2',
        simpleExplanation:
          'Instead of opening 1,000 threads to wait for 1,000 slow websites, an async event loop asks all 1,000 websites simultaneously and wakes up whenever any single response arrives: high concurrency on one single thread.',
        detailedExplanation:
          'Python (CPython) utilizes a Global Interpreter Lock (GIL) that restricts execution of Python bytecode to a single OS thread at a time, preventing true CPU-bound parallelism with raw threading. However, I/O-bound programs spend most of their time waiting for network sockets or disk reads. Asyncio solves this with cooperative multitasking using an Event Loop, coroutines (async def), and non-blocking await pauses, achieving tens of thousands of concurrent connections.',
        importantConcepts: [
          'Global Interpreter Lock (GIL): CPython mutex ensuring thread safety of internal reference counting',
          'Event Loop: Central scheduler that cycles through registered tasks and dispatches ready callbacks',
          'async def / await: Defines non-blocking coroutines; await yields control back to the event loop',
          'CPU-bound vs I/O-bound: Use multiprocessing for CPU tasks; use asyncio for I/O tasks'
        ],
        examples: [
          {
            title: 'Concurrent HTTP Fetching with Asyncio',
            problem: 'Fetch 3 remote API endpoints concurrently without blocking sequential execution.',
            solution: 'import asyncio\\nasync def fetch(url):\\n    await asyncio.sleep(1) # simulates network I/O\\n    return f"Data from {url}"\\nasync def main():\\n    results = await asyncio.gather(fetch("api1"), fetch("api2"), fetch("api3"))\\n    # Finishes in ~1 sec total instead of 3 secs!'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'python',
          content: `import asyncio

async def download_file(file_id, delay):
    print(f"Starting download {file_id}...")
    await asyncio.sleep(delay) # non-blocking I/O pause
    print(f"Finished {file_id}!")
    return f"Payload_{file_id}"

async def main():
    # Run tasks concurrently in parallel event loop
    results = await asyncio.gather(
        download_file(1, 2),
        download_file(2, 1),
        download_file(3, 3)
    )
    print("All downloads complete:", results)

asyncio.run(main())`,
          caption: 'Concurrent execution using asyncio.gather without thread blocking'
        },
        stepByStep: [
          { step: 1, title: 'Define Coroutines', description: 'Use async def for functions performing non-blocking asynchronous operations.' },
          { step: 2, title: 'Await Async Operations', description: 'Use await on asynchronous calls to yield control during I/O latency.' },
          { step: 3, title: 'Aggregate with Gather', description: 'Use asyncio.gather() or TaskGroup to run multiple coroutines concurrently.' },
          { step: 4, title: 'Start Event Loop', description: 'Bootstrap the application using asyncio.run(main()).' }
        ],
        keyPoints: [
          'The GIL does not slow down asyncio because I/O releases the GIL while waiting.',
          'Never execute blocking synchronous calls (like time.sleep or requests.get) inside async coroutines.'
        ],
        commonMistakes: [
          'Using synchronous blocking calls inside async functions (stalls the entire event loop for all tasks).',
          'Forgetting to await a coroutine (returns an unawaited coroutine object instead of the value).'
        ],
        quickRevision: [
          'GIL limits CPython to 1 thread of bytecode.',
          'Multiprocessing = CPU bound.',
          'Asyncio = I/O bound.',
          'async def creates coroutine; await pauses.'
        ],
        assessmentQuestions: [
          {
            id: 'q_asy1',
            question: 'Why is asyncio well suited for high-concurrency web servers despite the Python Global Interpreter Lock (GIL)?',
            options: ['Asyncio deletes the GIL from memory', 'Network I/O operations release the GIL while waiting for sockets, allowing the single-threaded event loop to juggle thousands of connections', 'Asyncio turns Python into C', 'It runs without an operating system'],
            correctIndex: 1,
            explanation: 'Web traffic is dominated by waiting for network latency. While waiting on socket I/O, the event loop switches to serve other ready tasks without blocking CPU execution.'
          }
        ]
      }
    ]
  },

  // ==========================================
  // 7. AI & ML (CSE-301)
  // ==========================================
  {
    id: 'ai-ml',
    title: 'AI & ML',
    code: 'CSE-301',
    department: 'Artificial Intelligence & Data Science',
    credits: 4,
    icon: '🤖',
    accent: '#8B5CF6',
    accentLight: 'rgba(139, 92, 246, 0.12)',
    badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    description: 'Loss function landscapes, gradient descent optimizers, backpropagation, decision trees, random forests, and CNN vision models.',
    topicsCount: 4,
    topics: [
      {
        id: 'ai-gradient',
        subjectId: 'ai-ml',
        title: 'Gradient Descent & Loss Landscapes',
        unitNumber: 1,
        unitTitle: 'Optimization Mechanics & Convergence',
        difficulty: 'Intermediate',
        estimatedMinutes: 45,
        referenceCitation: 'Ref: Ian Goodfellow, Yoshua Bengio, Aaron Courville - Deep Learning, Ch. 4 & 8',
        simpleExplanation:
          'Imagine being blindfolded on a foggy mountain and wanting to reach the lowest valley. You feel the slope with your feet and take a step in the steepest downward direction, repeating until you reach the bottom: that is gradient descent.',
        detailedExplanation:
          'Gradient Descent is a first-order iterative optimization algorithm used to minimize differentiable objective loss functions L(θ). By computing the gradient vector ∇_θ L, model weights update in the opposite direction of the gradient scaled by a learning rate η: θ := θ - η ∇_θ L. Variants include Batch GD, Stochastic GD (SGD with high variance), Mini-Batch GD, and adaptive learning rate algorithms like Adam (Adaptive Moment Estimation).',
        importantConcepts: [
          'Weight Update Rule: θ_{t+1} = θ_t - η ∇ L(θ_t)',
          'Learning Rate η: Too large causes divergence/overshooting; too small causes painfully slow convergence',
          'Saddle Points & Local Minima: High-dimensional loss landscapes are dominated by saddle points',
          'Adam Optimizer: Combines exponential moving averages of gradients (momentum) and squared gradients (RMSProp)'
        ],
        examples: [
          {
            title: '1D Gradient Descent Step',
            problem: 'Loss function L(w) = w². Current weight w = 4. Learning rate η = 0.1. What is the updated weight w_new?',
            solution:
              'dL/dw = 2w.\\nAt w = 4, gradient is 2(4) = 8.\\nw_new = w - η (dL/dw) = 4 - (0.1)(8) = 4 - 0.8 = 3.2.\\nThe weight steps closer to the optimal minimum at w = 0.'
          }
        ],
        formulasOrCode: {
          type: 'formula',
          content: '\\theta_{t+1} = \\theta_t - \\eta \\nabla_\\theta L(\\theta_t), \\quad m_t = \\beta_1 m_{t-1} + (1-\\beta_1)g_t, \\quad v_t = \\beta_2 v_{t-1} + (1-\\beta_2)g_t^2',
          caption: 'Standard Gradient Descent Update Rule and Adam First/Second Moment Accumulators'
        },
        stepByStep: [
          { step: 1, title: 'Forward Pass', description: 'Compute model predictions ŷ and evaluate loss L(y, ŷ).' },
          { step: 2, title: 'Backward Pass', description: 'Compute partial derivatives of loss with respect to all parameters ∇_θ L.' },
          { step: 3, title: 'Update Weights', description: 'Subtract scaled gradient from existing weights and zero gradients for next batch.' }
        ],
        keyPoints: [
          'Mini-batch size balances hardware GPU vectorization with gradient estimate noise.',
          'Momentum dampens oscillations in ravines where surface curves much more steeply in one dimension.'
        ],
        commonMistakes: [
          'Setting learning rate too high, causing loss to explode to NaN.',
          'Failing to scale input features (unscaled features produce elongated, eccentric loss ellipses).'
        ],
        quickRevision: [
          'θ := θ - η ∇L.',
          'High η = Overshoot; Low η = Slow.',
          'Adam uses momentum + RMSProp.',
          'Feature scaling speeds convergence.'
        ],
        assessmentQuestions: [
          {
            id: 'q_gd1',
            question: 'What happens to the gradient descent optimization process if the learning rate η is set excessively high?',
            options: ['Model converges instantly', 'Loss oscillates wildly and diverges toward infinity', 'Weights freeze', 'Gradient becomes exactly zero'],
            correctIndex: 1,
            explanation: 'An overly large step size overshoots the valley floor, bouncing to higher points on opposite walls and causing numerical instability and divergence.'
          }
        ]
      },
      {
        id: 'ai-neural',
        subjectId: 'ai-ml',
        title: 'Neural Networks & Backpropagation',
        unitNumber: 2,
        unitTitle: 'Feedforward Architectures & Chain Rule',
        difficulty: 'Advanced',
        estimatedMinutes: 50,
        referenceCitation: 'Ref: Michael Nielsen - Neural Networks and Deep Learning, Ch. 2',
        simpleExplanation:
          'A neural network is layers of artificial neurons wired together. Backpropagation is learning from mistakes: the output checks how wrong it was, and sends blame backward through every layer so each neuron adjusts its dials.',
        detailedExplanation:
          'Artificial Neural Networks (ANNs) consist of layers of interconnected artificial neurons computing linear transformations followed by non-linear activations: a = σ(Wa + b). Backpropagation applies the multivariable calculus chain rule to systematically propagate error gradients backward from the output layer to the input layer, computing ∂L/∂W and ∂L/∂b for all layers in O(parameters) time.',
        importantConcepts: [
          'Activation Functions: ReLU (max(0, x)), Sigmoid, Softmax (probability distribution over classes)',
          'Chain Rule: ∂L/∂w = (∂L/∂a) · (∂a/∂z) · (∂z/∂w)',
          'Vanishing Gradient Problem: Saturating activations (Sigmoid/Tanh) produce derivatives near 0 for deep layers',
          'Overfitting & Regularization: Dropout, L1/L2 weight decay, and early stopping prevent memorizing noise'
        ],
        examples: [
          {
            title: 'Output of Single Neuron with ReLU',
            problem: 'Weights W = [0.5, -1.2], inputs X = [2.0, 3.0], bias b = 1.0. Activation is ReLU. Find activation a.',
            solution:
              'Linear sum z = (0.5 × 2.0) + (-1.2 × 3.0) + 1.0 = 1.0 - 3.6 + 1.0 = -1.6.\\nReLU activation a = max(0, z) = max(0, -1.6) = 0.0.'
          }
        ],
        formulasOrCode: {
          type: 'formula',
          content: 'z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}, \\quad a^{[l]} = \\sigma(z^{[l]}), \\quad \\delta^{[l]} = \\frac{\\partial L}{\\partial z^{[l]}} = (W^{[l+1]T} \\delta^{[l+1]}) \\odot \\sigma\'(z^{[l]})',
          caption: 'Forward Feedforward Matrix Equations and Backpropagation Error Vector Recurrence'
        },
        stepByStep: [
          { step: 1, title: 'Forward Feed', description: 'Compute pre-activations z and activations a layer by layer to output.' },
          { step: 2, title: 'Output Error', description: 'Compute gradient at output layer: δ^{[L]} = ∇_a L ⊙ σ\'(z^{[L]}).' },
          { step: 3, title: 'Backpropagate Error', description: 'Propagate δ backward using transposed weight matrices and element-wise activation derivatives.' },
          { step: 4, title: 'Compute Parameter Gradients', description: 'Calculate ∂L/∂W^{[l]} = δ^{[l]} (a^{[l-1]})^T and ∂L/∂b^{[l]} = δ^{[l]}.' }
        ],
        keyPoints: [
          'ReLU avoids vanishing gradient for positive values because its derivative is constant 1.',
          'Weights must be initialized randomly (e.g. He or Xavier initialization) to break symmetry.'
        ],
        commonMistakes: [
          'Initializing all network weights to zeros (causes all hidden neurons to compute identical gradients).',
          'Using Sigmoid activation in hidden layers of deep networks (causes vanishing gradient).'
        ],
        quickRevision: [
          'z = Wx + b; a = σ(z).',
          'Backprop = Chain rule backward.',
          'ReLU = max(0, x).',
          'Break symmetry with random weights.'
        ],
        assessmentQuestions: [
          {
            id: 'q_ann1',
            question: 'Why will a neural network fail to learn if all its weights are initialized to 0.0?',
            options: ['Loss becomes negative', 'All neurons in each layer compute identical outputs and gradients, preserving symmetry and preventing specialized features', 'GPU refuses to execute zeros', 'Division by zero crash'],
            correctIndex: 1,
            explanation: 'Symmetric weights mean every neuron computes the identical gradient during backpropagation, causing all neurons to update identically as if there were only 1 single neuron.'
          }
        ]
      },
      {
        id: 'ai-trees',
        subjectId: 'ai-ml',
        title: 'Decision Trees, Random Forests & Ensembles',
        unitNumber: 3,
        unitTitle: 'Tree-Based Learning & Bagging/Boosting',
        difficulty: 'Intermediate',
        estimatedMinutes: 40,
        referenceCitation: 'Ref: Trevor Hastie, Robert Tibshirani - Elements of Statistical Learning, Ch. 9 & 10',
        simpleExplanation:
          'A decision tree is a flowchart of yes/no questions that narrows down a diagnosis. A Random Forest asks 100 different trees that each look at different clues, and takes the majority vote for supreme accuracy.',
        detailedExplanation:
          'Decision Trees recursively partition feature space into axis-aligned rectangular regions using greedy splitting criteria such as Gini Impurity or Information Gain (Entropy). While single trees suffer from high variance and severe overfitting, Random Forests mitigate this by combining Bagging (Bootstrap Aggregation) with random feature subspace sampling. Gradient Boosted Decision Trees (GBDT, XGBoost, LightGBM) sequentially train trees to fit residuals of predecessor trees.',
        importantConcepts: [
          'Gini Impurity: G = 1 - ∑ p_i² (measures classification impurity of a leaf node)',
          'Entropy & Information Gain: IG = H(parent) - ∑ (|D_v| / |D|) H(D_v)',
          'Bagging vs Boosting: Bagging trains independent trees in parallel to reduce variance; Boosting trains trees sequentially to reduce bias',
          'Out-Of-Bag (OOB) Error: Validation metric computed on unsampled bootstrap instances without a separate test split'
        ],
        examples: [
          {
            title: 'Computing Gini Impurity of a Node',
            problem: 'A leaf contains 6 positive samples and 4 negative samples (total 10). What is its Gini Impurity?',
            solution:
              'p(positive) = 6/10 = 0.6.\\np(negative) = 4/10 = 0.4.\\nGini = 1 - [(0.6)² + (0.4)²] = 1 - [0.36 + 0.16] = 1 - 0.52 = 0.48.'
          }
        ],
        formulasOrCode: {
          type: 'formula',
          content: 'Gini = 1 - \\sum_{i=1}^{C} p_i^2, \\quad H(S) = -\\sum_{i=1}^{C} p_i \\log_2(p_i), \\quad IG = H(S) - \\sum_{v \\in \\text{children}} \\frac{|S_v|}{|S|} H(S_v)',
          caption: 'Gini Impurity, Shannon Entropy, and Information Gain Splitting Metrics'
        },
        stepByStep: [
          { step: 1, title: 'Evaluate Splits', description: 'Iterate across all candidate features and thresholds to evaluate Gini/Entropy reduction.' },
          { step: 2, title: 'Select Optimal Split', description: 'Choose feature and split point that maximizes Information Gain.' },
          { step: 3, title: 'Recurse or Stop', description: 'Repeat on child partitions until max depth, min samples, or pure leaf criteria are satisfied.' }
        ],
        keyPoints: [
          'Decision trees require zero feature normalization or scaling.',
          'Random Forests decorrelate individual trees by sampling a random subset of √p features at each split.'
        ],
        commonMistakes: [
          'Allowing a decision tree to grow unrestricted without pruning or max_depth limits (guarantees overfitting).',
          'Confusing Bagging (parallel variance reduction) with Boosting (sequential bias reduction).'
        ],
        quickRevision: [
          'Gini = 0 is pure.',
          'Random Forest = Bagging + Feature sampling.',
          'Boosting fits residuals sequentially.',
          'No feature scaling required.'
        ],
        assessmentQuestions: [
          {
            id: 'q_tree1',
            question: 'What is the Gini impurity value of a leaf node where all samples belong exclusively to the same single class?',
            options: ['1.0', '0.5', '0.0', '-1.0'],
            correctIndex: 2,
            explanation: 'When all samples belong to one class, p = 1.0. Gini = 1 - (1.0)² = 0.0, indicating a completely pure node.'
          }
        ]
      },
      {
        id: 'ai-cnn',
        subjectId: 'ai-ml',
        title: 'Convolutional Neural Networks (CNNs)',
        unitNumber: 4,
        unitTitle: 'Computer Vision & Spatial Feature Hierarchies',
        difficulty: 'Advanced',
        estimatedMinutes: 50,
        referenceCitation: 'Ref: Alex Krizhevsky et al. - ImageNet Classification with Deep CNNs (NeurIPS 2012)',
        simpleExplanation:
          'A standard network flattens pictures into a messy line of numbers. A CNN slides small magnifying glasses (kernels) across the image to spot edges, corners, textures, and shapes while keeping the 2D layout intact.',
        detailedExplanation:
          'Convolutional Neural Networks exploit spatial locality and translation invariance in image and grid data. Convolution layers apply learnable weight filter kernels that slide across feature maps, performing dot products to extract hierarchical representations (early layers detect edges/gradients; deeper layers detect complex object parts). Pooling layers (MaxPooling) reduce spatial dimensions, providing translation invariance and reducing compute.',
        importantConcepts: [
          'Convolution Operation: Element-wise multiplication and accumulation of filter kernel and receptive field',
          'Stride & Padding: Controls output feature map dimensions: Output = ((Input - Kernel + 2·Padding) / Stride) + 1',
          'Parameter Sharing: Same filter weights applied across entire spatial field, drastically cutting parameter count',
          'Receptive Field: Region of input image that directly influences a specific neuron’s activation'
        ],
        examples: [
          {
            title: 'Output Feature Map Dimension Calculation',
            problem: 'Input image is 32×32. Filter size is 5×5. Stride = 1. Padding = 2. What is the output feature map size?',
            solution:
              'Output = ((W - K + 2P) / S) + 1\\nOutput = ((32 - 5 + 2(2)) / 1) + 1 = ((32 - 5 + 4) / 1) + 1 = (31 / 1) + 1 = 32.\\nThe spatial dimensions remain 32×32 (Same Padding).'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'python',
          content: `import torch
import torch.nn as nn

class SimpleCNN(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(in_channels=3, out_channels=32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2) # halves spatial size
        )
        self.classifier = nn.Linear(32 * 16 * 16, num_classes)
        
    def forward(self, x):
        x = self.features(x)
        x = torch.flatten(x, 1)
        return self.classifier(x)`,
          caption: 'PyTorch Convolutional Neural Network with Conv2D, BatchNorm, and MaxPool'
        },
        stepByStep: [
          { step: 1, title: 'Convolution Stage', description: 'Pass 3D input tensor through multiple learnable kernels to yield feature activation maps.' },
          { step: 2, title: 'Non-Linear Activation', description: 'Apply ReLU activation element-wise.' },
          { step: 3, title: 'Spatial Downsampling', description: 'Apply MaxPooling (e.g. 2×2 window with stride 2) to condense spatial resolution.' },
          { step: 4, title: 'Dense Classification', description: 'Flatten multi-channel feature maps into 1D vector and pass through Fully Connected layers.' }
        ],
        keyPoints: [
          'Parameter sharing dramatically lowers parameter count compared to fully connected layers.',
          'Deeper layers aggregate smaller receptive fields into high-level semantic abstractions.'
        ],
        commonMistakes: [
          'Using fully connected layers directly on high-resolution raw pixels (leads to millions of redundant weights).',
          'Incorrectly computing tensor dimensions before flattening into fully connected classifier layers.'
        ],
        quickRevision: [
          'Output = ((W - K + 2P)/S) + 1.',
          'Filters extract spatial features.',
          'MaxPool provides translation invariance.',
          'Parameter sharing saves weights.'
        ],
        assessmentQuestions: [
          {
            id: 'q_cnn1',
            question: 'What architectural advantage enables Convolutional Neural Networks to process 1024×1024 images efficiently without millions of weights per pixel?',
            options: ['Zero activation functions', 'Parameter sharing where the same small filter kernel slides across the entire image', 'Bypassing backpropagation', 'Storing images as plain text'],
            correctIndex: 1,
            explanation: 'In CNNs, a small kernel (e.g. 3×3 = 9 weights) is reused across all spatial locations, drastically reducing parameter count compared to fully connected connections.'
          }
        ]
      }
    ]
  },

  // ==========================================
  // 8. DATABASE (CSE-204)
  // ==========================================
  {
    id: 'database',
    title: 'Database',
    code: 'CSE-204',
    department: 'Computer Science & Data Engineering',
    credits: 4,
    icon: '🗄',
    accent: '#E11D48',
    accentLight: 'rgba(225, 29, 72, 0.12)',
    badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    description: 'Relational normalization (1NF-BCNF), ACID transactions, isolation levels, B+ tree indexing, and SQL cost-based query execution.',
    topicsCount: 4,
    topics: [
      {
        id: 'db-normalization',
        subjectId: 'database',
        title: 'Relational Normalization: 1NF to BCNF',
        unitNumber: 1,
        unitTitle: 'Schema Design & Redundancy Elimination',
        difficulty: 'Intermediate',
        estimatedMinutes: 45,
        referenceCitation: 'Ref: Silberschatz, Korth, Sudarshan - Database System Concepts, 7th Ed., Ch. 7',
        simpleExplanation:
          'Normalization is organizing a messy spreadsheet into clean, well-linked tables so you never have to type someone’s phone number or address in twenty different rows.',
        detailedExplanation:
          'Database Normalization is the systematic process of decomposing relational tables to eliminate data redundancy, prevent update, insertion, and deletion anomalies, and guarantee dependency preservation. Normal forms progress sequentially: First Normal Form (1NF: atomic values), Second Normal Form (2NF: elimination of partial dependencies on composite keys), Third Normal Form (3NF: elimination of transitive dependencies), and Boyce-Codd Normal Form (BCNF: every determinant must be a candidate key).',
        importantConcepts: [
          '1NF: Attributes must hold atomic (indivisible) values with no repeating groups',
          '2NF: Must be in 1NF and have NO partial dependencies (non-prime attributes fully dependent on candidate keys)',
          '3NF: Must be in 2NF and have NO transitive dependencies (X → Y and Y → Z where Z is non-prime)',
          'BCNF: For every functional dependency X → Y, X must be a superkey'
        ],
        examples: [
          {
            title: 'Detecting Transitive Dependency (3NF Violation)',
            problem: 'Table: Student_Exam(StudentID, CourseID, ProfessorID, ProfessorOffice). Primary key is (StudentID, CourseID). Is this in 3NF?',
            solution:
              'Functional dependencies:\\n(StudentID, CourseID) -> ProfessorID\\nProfessorID -> ProfessorOffice\\nHere ProfessorOffice depends on ProfessorID (a non-prime attribute), which depends on the candidate key.\\nThis is a Transitive Dependency! It violates 3NF and causes update anomalies if a professor changes offices.'
          }
        ],
        formulasOrCode: {
          type: 'formula',
          content: '\\text{1NF: Atomic values} \\quad \\longrightarrow \\quad \\text{2NF: No partial key deps} \\quad \\longrightarrow \\quad \\text{3NF: No transitive deps} \\quad \\longrightarrow \\quad \\text{BCNF: } \\forall (X \\to Y), X \\in \\text{SuperKey}',
          caption: 'Hierarchy of Relational Database Normal Forms'
        },
        stepByStep: [
          { step: 1, title: 'Ensure Atomicity (1NF)', description: 'Split comma-separated values or arrays into discrete atomic columns and rows.' },
          { step: 2, title: 'Remove Partial Dependencies (2NF)', description: 'Ensure non-key columns depend on the entirety of composite candidate keys.' },
          { step: 3, title: 'Remove Transitive Dependencies (3NF)', description: 'Separate intermediate non-key dependencies into dedicated lookup tables.' },
          { step: 4, title: 'Verify BCNF', description: 'Ensure every determinant in functional dependencies is a valid candidate key.' }
        ],
        keyPoints: [
          'Decomposition must always be lossless (Lossless-Join Decomposition).',
          'Real-world OLAP data warehouses often intentionally denormalize schemas (star schemas) to avoid expensive joins.'
        ],
        commonMistakes: [
          'Decomposing tables in a way that loses dependencies or cannot reconstruct the original data via natural join.',
          'Storing multiple values (like multiple phone numbers) in a single string column.'
        ],
        quickRevision: [
          '1NF = Atomic values.',
          '2NF = No partial dependencies.',
          '3NF = No transitive dependencies.',
          'BCNF = Determinant must be superkey.'
        ],
        assessmentQuestions: [
          {
            id: 'q_norm1',
            question: 'Which normal form is violated if a non-key attribute depends on another non-key attribute (X → Y → Z)?',
            options: ['1NF', '2NF', '3NF', 'BCNF'],
            correctIndex: 2,
            explanation: 'A non-key attribute depending on another non-key attribute forms a transitive dependency, which directly violates Third Normal Form (3NF).'
          }
        ]
      },
      {
        id: 'db-acid',
        subjectId: 'database',
        title: 'ACID Transactions & Concurrency Control',
        unitNumber: 2,
        unitTitle: 'Transaction Management & Isolation Levels',
        difficulty: 'Advanced',
        estimatedMinutes: 50,
        referenceCitation: 'Ref: Jim Gray, Andreas Reuter - Transaction Processing: Concepts and Techniques, Ch. 4',
        simpleExplanation:
          'When you transfer money from bank account A to bank account B, the money must leave A AND arrive in B. If the power cuts halfway through, the whole transfer cancels completely: that is an ACID transaction.',
        detailedExplanation:
          'A database transaction is a logical unit of work satisfying ACID properties: Atomicity (all-or-nothing execution via write-ahead logging), Consistency (preserves database integrity constraints), Isolation (concurrent transactions execute without interference), and Durability (committed changes persist across crashes). Concurrency anomalies include Dirty Reads, Non-Repeatable Reads, and Phantom Reads, regulated across ANSI SQL isolation levels.',
        importantConcepts: [
          'Atomicity: Transaction operations succeed entirely or rollback cleanly via WAL (Write-Ahead Log)',
          'Isolation Levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable',
          'Concurrency Anomalies: Dirty Read (reading uncommitted data), Non-Repeatable Read (modified values), Phantom Read (inserted rows)',
          'Two-Phase Locking (2PL): Growing phase (acquire locks) and Shrinking phase (release locks) guarantees serializability'
        ],
        examples: [
          {
            title: 'Preventing Dirty Reads',
            problem: 'Transaction 1 updates balance to ₹5000 but has not committed. Transaction 2 reads ₹5000. Transaction 1 then aborts and rolls back. What occurred?',
            solution:
              'Transaction 2 read uncommitted dirty data that was later discarded.\\nThis is a Dirty Read anomaly.\\nSetting the isolation level to Read Committed or higher prevents this by blocking reads on uncommitted writes.'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'sql',
          content: `-- Safe Banking Transfer Transaction
BEGIN TRANSACTION;

UPDATE accounts 
SET balance = balance - 1000 
WHERE account_id = 'ACC_SURYA';

UPDATE accounts 
SET balance = balance + 1000 
WHERE account_id = 'ACC_SADHANA';

-- Check integrity constraints before finalizing
COMMIT;`,
          caption: 'Atomic bank transfer transaction with complete rollback safety'
        },
        stepByStep: [
          { step: 1, title: 'Begin Transaction', description: 'Start logical transaction boundary; log start in WAL.' },
          { step: 2, title: 'Execute Operations', description: 'Apply database updates; track rollback undo logs in memory buffer.' },
          { step: 3, title: 'Commit or Rollback', description: 'Write-ahead log flushed to non-volatile disk; release locks.' }
        ],
        keyPoints: [
          'Durability guarantees committed data survives power failures via write-ahead logging (WAL).',
          'Serializable isolation prevents all concurrency anomalies but incurs severe lock contention overhead.'
        ],
        commonMistakes: [
          'Performing network API calls inside long-running database transactions (holds row locks open too long).',
          'Assuming Read Committed prevents phantom reads (it only prevents dirty reads).'
        ],
        quickRevision: [
          'A = All or nothing.',
          'C = Consistent rules.',
          'I = Isolated from others.',
          'D = Durable on disk.',
          'Serializable = Zero anomalies.'
        ],
        assessmentQuestions: [
          {
            id: 'q_acid1',
            question: 'Which transaction phenomenon occurs when Transaction A re-runs a query and finds new rows inserted and committed by Transaction B?',
            options: ['Dirty Read', 'Non-Repeatable Read', 'Phantom Read', 'Lost Update'],
            correctIndex: 2,
            explanation: 'Phantom reads occur when a transaction queries a range of rows twice and sees newly committed rows matching the criteria inserted by another transaction.'
          }
        ]
      },
      {
        id: 'db-indexes',
        subjectId: 'database',
        title: 'B-Trees, B+ Trees & Indexing Internals',
        unitNumber: 3,
        unitTitle: 'Disk Storage Engines & Index Structures',
        difficulty: 'Intermediate',
        estimatedMinutes: 45,
        referenceCitation: 'Ref: Database Internals - Alex Petrov, Ch. 2 (B-Tree Basics)',
        simpleExplanation:
          'Without an index, finding a customer record requires scanning all 10 million rows on disk. A B+ Tree index is like the alphabetical thumb-tabs on a dictionary that guide you directly to the exact page in 3 disk reads.',
        detailedExplanation:
          'Databases store data on block-based persistent storage disks where I/O seeks are slow. B+ Trees are self-balancing multi-way search trees optimized for block storage. Unlike standard binary trees, B+ tree internal nodes store multiple routing keys to maximize branching factor (fan-out) and minimize tree height (depth 3-4 can index billions of rows). In a B+ Tree, ALL record pointers reside strictly in leaf nodes, which are linked as a doubly-linked list for lightning-fast range scans.',
        importantConcepts: [
          'High Fan-out: Wide branching factor (hundreds of keys per node) minimizes disk seeks',
          'B-Tree vs B+ Tree: In B+ Trees, satellite data pointers reside only at leaves; internal nodes store only routing keys',
          'Clustered Index: Determines physical disk order of table rows (only 1 clustered index per table)',
          'Non-Clustered (Secondary) Index: Separate tree storing secondary key pointing to clustered primary key'
        ],
        examples: [
          {
            title: 'Why B+ Trees Outperform Binary Search Trees on Disk',
            problem: 'A database has 1,000,000 rows. Compare tree height for BST (fanout 2) vs B+ Tree (fanout 100).',
            solution:
              'BST height = log₂(1,000,000) ≈ 20 disk seeks.\\nB+ Tree height = log₁₀₀(1,000,000) = 3 disk seeks.\\nSince disk I/O is the bottleneck, the B+ Tree is ~7x faster in disk read latency!'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'sql',
          content: `-- Creating a composite secondary index for fast multi-column lookups
CREATE INDEX idx_student_dept_gpa 
ON students (department, gpa DESC);

-- Query benefits from index seek instead of full table scan
SELECT student_id, name, gpa 
FROM students 
WHERE department = 'Computer Science' 
  AND gpa >= 3.8;`,
          caption: 'Composite B+ Tree secondary index optimizing multi-column range scans'
        },
        stepByStep: [
          { step: 1, title: 'Traverse Root to Leaf', description: 'Perform binary search within internal node keys to determine branch pointer.' },
          { step: 2, title: 'Reach Leaf Node', description: 'Search leaf node for matching index key and retrieve disk pointer or primary key.' },
          { step: 3, title: 'Range Traversal', description: 'For range queries (WHERE x BETWEEN 10 AND 50), follow sibling leaf pointers horizontally without re-traversing tree.' }
        ],
        keyPoints: [
          'Leaf nodes in B+ Trees are linked sequentially, making range queries O(log n + k) exceptionally fast.',
          'Every leaf in a B+ Tree is located at the exact same depth.'
        ],
        commonMistakes: [
          'Over-indexing tables (each index speeds up SELECTs but slows down every INSERT, UPDATE, and DELETE).',
          'Violating leftmost prefix rule in composite indexes (an index on (A, B) cannot accelerate queries filtering only on B).'
        ],
        quickRevision: [
          'High fanout = Few disk reads.',
          'B+ Tree leaves hold all data.',
          'Leaves are linked for range scans.',
          '1 clustered index per table.'
        ],
        assessmentQuestions: [
          {
            id: 'q_btr1',
            question: 'Why do relational storage engines (MySQL InnoDB, PostgreSQL) prefer B+ Trees over standard B-Trees for database indexes?',
            options: ['B+ Trees require zero memory', 'In B+ Trees, all data resides in leaves linked as a linked list, making sequential range scans dramatically faster', 'B+ Trees do not support duplicates', 'B+ Trees run on GPUs'],
            correctIndex: 1,
            explanation: 'Because leaf nodes are linked in a continuous sequence, range queries (e.g. BETWEEN or >) can traverse contiguous disk pages without repeatedly returning to parent nodes.'
          }
        ]
      },
      {
        id: 'db-query',
        subjectId: 'database',
        title: 'SQL Execution Plans & Cost Optimizers',
        unitNumber: 4,
        unitTitle: 'Query Optimization & Relational Algebra',
        difficulty: 'Advanced',
        estimatedMinutes: 45,
        referenceCitation: 'Ref: Hector Garcia-Molina, Jeff Ullman - Database Systems: The Complete Book, 2nd Ed., Ch. 15 & 16',
        simpleExplanation:
          'When you run a SQL query, you describe what you want, not how to find it. The database cost optimizer tests hundreds of strategies (which table to read first, which index to use) and picks the fastest flight path.',
        detailedExplanation:
          'Relational database engines parse declarative SQL into relational algebra expression trees. The Cost-Based Optimizer (CBO) estimates the disk I/O and CPU cost of alternative physical execution plans using system catalog statistics and column histograms. It evaluates table access methods (Sequential Table Scan vs Index Seek/Scan) and join algorithms (Nested Loop Join, Hash Join, Merge Join) to select the execution plan with minimum expected cost.',
        importantConcepts: [
          'EXPLAIN ANALYZE: Inspects actual execution plan and time spent per relational operator',
          'Index Scan vs Table Scan: Index seek navigates tree directly; Table Scan reads all table pages from disk',
          'Join Algorithms: Nested Loop (small outer table), Hash Join (large unsorted inputs), Sort-Merge Join (pre-sorted inputs)',
          'Cardinality Estimation: Optimizer predicts number of rows passing filter predicates using data histograms'
        ],
        examples: [
          {
            title: 'Evaluating Join Strategies',
            problem: 'Table Orders has 5,000,000 rows. Table Customers has 10,000 rows. Which join algorithm is optimal for an equi-join?',
            solution:
              'A Hash Join is typically chosen:\\n1. Build in-memory hash table on the smaller table (Customers).\\n2. Stream and probe rows from the larger table (Orders).\\nRuns in O(M + N) time without needing indexes on join keys.'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'sql',
          content: `-- Viewing the physical cost execution plan
EXPLAIN ANALYZE
SELECT c.name, COUNT(o.order_id) AS total_orders
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE c.country = 'India'
GROUP BY c.name
ORDER BY total_orders DESC;`,
          caption: 'Using EXPLAIN ANALYZE to inspect table scans, join types, and cost estimations'
        },
        stepByStep: [
          { step: 1, title: 'SQL Parsing', description: 'Validate query syntax and resolve column names against system catalog.' },
          { step: 2, title: 'Logical Optimization', description: 'Apply relational algebra rewrites (e.g. push filters down before joins).' },
          { step: 3, title: 'Physical Optimization', description: 'Estimate costs for access paths and choose lowest cost execution plan.' },
          { step: 4, title: 'Execution', description: 'Iterate over chosen execution plan operators to stream result tuples.' }
        ],
        keyPoints: [
          'Predicate pushdown filters rows as early as possible to minimize intermediate data volumes.',
          'Stale table statistics lead the optimizer to make poor join and index choices (resolve with ANALYZE TABLE).'
        ],
        commonMistakes: [
          'Wrapping indexed columns in functions like WHERE UPPER(email) = ... (prevents index seeks, forcing a full table scan).',
          'Neglecting EXPLAIN output and diagnosing query latency by guessing.'
        ],
        quickRevision: [
          'CBO selects lowest estimated cost.',
          'Push filters down before joins.',
          'Hash Join for large unsorted tables.',
          'Avoid functions on indexed columns.'
        ],
        assessmentQuestions: [
          {
            id: 'q_opt1',
            question: 'Why does writing WHERE YEAR(created_at) = 2026 typically cause a query to perform a slow Full Table Scan even if created_at is indexed?',
            options: ['Databases cannot store years', 'Applying a function to an indexed column prevents the optimizer from performing a direct B-Tree index seek', 'The database runs out of locks', 'The year 2026 is invalid'],
            correctIndex: 1,
            explanation: 'The index stores raw timestamp values. Wrapping the column inside YEAR() forces the engine to evaluate the function on every single row in the table instead of doing an index range seek (use created_at BETWEEN \'2026-01-01\' AND \'2026-12-31\' instead).'
          }
        ]
      }
    ]
  }
];