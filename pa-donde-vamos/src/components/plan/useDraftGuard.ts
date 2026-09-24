import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback } from 'react';

import type { PlanDraft } from '@/data/types';
import { useAppStore } from '@/store/useAppStore';

/**
 * Sends the user back to an earlier step when the draft is missing what this step needs
 * (deep link, web refresh after the plan was created…). Runs on focus only, so screens left
 * underneath in the stack never redirect when the draft is committed and cleared.
 */
export function useDraftGuard(isValid: (draft: PlanDraft) => boolean, redirect: Href) {
  useFocusEffect(
    useCallback(() => {
      if (!isValid(useAppStore.getState().draft)) router.replace(redirect);
    }, [isValid, redirect]),
  );
}
