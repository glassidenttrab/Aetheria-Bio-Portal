import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'server'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'off',
      // 기존 코드베이스에 미사용 import/변수가 다수 남아 있어(tsconfig에서도 의도적으로
      // noUnusedLocals가 꺼져 있음), 당장은 경고로만 표시해 점진적으로 정리한다.
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      // eslint-plugin-react-hooks v7이 함께 도입한 React Compiler용 규칙들.
      // 이 프로젝트는 React Compiler를 쓰지 않고, 두 규칙 모두 useEffect 안에서
      // 데이터를 불러오거나 Date.now()로 1회성 ID를 만드는 흔한 정상 패턴까지
      // 오류로 잡아내므로 비활성화.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
    },
  }
);
