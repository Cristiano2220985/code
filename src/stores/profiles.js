import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { loadState, saveState } from "@/services/storage";
import { buildProfile, validateProfileName } from "@/utils/profile";

const STORAGE_KEY = "profiles";

export const useProfilesStore = defineStore("profiles", () => {
  const saved = loadState(STORAGE_KEY, { profiles: [], activeProfileId: null });

  const profiles = ref(saved.profiles);
  const activeProfileId = ref(saved.activeProfileId);

  const hasProfiles = computed(() => profiles.value.length > 0);

  // Recipe searches and AI suggestions should read the constraints from here.
  const activeProfile = computed(
    () =>
      profiles.value.find((profile) => profile.id === activeProfileId.value) ??
      null,
  );

  function persist() {
    saveState(STORAGE_KEY, {
      profiles: profiles.value,
      activeProfileId: activeProfileId.value,
    });
  }

  function addProfile(draft) {
    const error = validateProfileName(draft.name, profiles.value);
    if (error) {
      throw new Error(error);
    }

    const profile = buildProfile(draft);
    profiles.value.push(profile);

    if (!activeProfileId.value) {
      activeProfileId.value = profile.id;
    }

    persist();
    return profile;
  }

  function setActiveProfile(id) {
    if (!profiles.value.some((profile) => profile.id === id)) {
      return;
    }

    activeProfileId.value = id;
    persist();
  }

  return {
    profiles,
    activeProfileId,
    hasProfiles,
    activeProfile,
    addProfile,
    setActiveProfile,
  };
});
