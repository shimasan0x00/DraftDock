import { DraftDockAPI } from '../shared/types';

declare global {
  interface Window {
    draftdock: DraftDockAPI;
  }
}
