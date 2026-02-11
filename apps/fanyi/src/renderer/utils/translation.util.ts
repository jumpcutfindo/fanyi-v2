import * as OpenCC from 'opencc-js';

export const s2t = OpenCC.Converter({ from: 'cn', to: 'tw' }); // Simplified to Traditional
export const t2s = OpenCC.Converter({ from: 'tw', to: 'cn' }); // Traditional to Simplified
