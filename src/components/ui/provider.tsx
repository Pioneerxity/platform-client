'use client';

import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { ColorModeProvider, type ColorModeProviderProps } from './color-mode';
import { ReactFlowProvider } from '@xyflow/react';

export function Provider(props: ColorModeProviderProps) {
  return (
    <ReactFlowProvider>
      <ChakraProvider value={defaultSystem}>
        <ColorModeProvider {...props} />
      </ChakraProvider>
    </ReactFlowProvider>
  );
}
