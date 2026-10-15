import { loadFont } from '@remotion/google-fonts/PlusJakartaSans';

const { fontFamily } = loadFont('normal', {
  weights: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
});

export { fontFamily };
