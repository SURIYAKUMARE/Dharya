import { useAuth } from '../context/AuthContext';
import { MASKED_FEATURES, MaskedFeature } from '../config/maskingConfig';

export function useMaskedFeature(featureId: string) {
  const { isAuthenticated, disguiseMode, currentUser } = useAuth();
  const feature: MaskedFeature = MASKED_FEATURES[featureId] || {
    id: featureId,
    route: `/${featureId}`,
    publicLabel: 'Academic Resource',
    publicShortLabel: 'Resource',
    publicIcon: 'BookOpen',
    publicCategory: 'STUDY MODULE',
    publicDescription: 'Curated institutional engineering course material.',
    publicCourseCode: 'ENGR-200',
    publicMockPreview: 'Standard curriculum module indexed for student reference.',
    privateLabel: 'Special Space',
    privateShortLabel: 'Space',
    privateDescription: 'Our private space.'
  };

  // Mask is active if the user is NOT authenticated OR if user pressed the panic camouflage button
  const isMasked = !isAuthenticated || disguiseMode;

  return {
    feature,
    isMasked,
    title: isMasked ? feature.publicLabel : feature.privateLabel,
    shortTitle: isMasked ? feature.publicShortLabel : feature.privateShortLabel,
    description: isMasked ? feature.publicDescription : feature.privateDescription,
    category: isMasked ? feature.publicCategory : 'PRIVATE & CONFIDENTIAL ✦',
    courseCode: isMasked ? feature.publicCourseCode : `SURYA & SADHANA 💖`,
    currentUser,
  };
}
