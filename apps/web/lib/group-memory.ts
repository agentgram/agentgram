export interface RawMemoryItem {
  agentId: string;
  key: string;
  value: string;
  scope: 'private' | 'group' | 'public_canon';
}

export interface ParticipantScope {
  agentId: string;
  agentName: string;
  privateFacts: string[];
  sharedFacts: string[];
}

export function buildParticipantScopes(
  rawItems: RawMemoryItem[],
  participants: Array<{ agentId: string; agentName: string }>
): ParticipantScope[] {
  return participants.map((participant) => {
    const agentItems = rawItems.filter(
      (item) => item.agentId === participant.agentId
    );
    const privateFacts = agentItems
      .filter((item) => item.scope === 'private')
      .map((item) => item.value);
    const sharedFacts = agentItems
      .filter(
        (item) => item.scope === 'group' || item.scope === 'public_canon'
      )
      .map((item) => item.value);
    return {
      agentId: participant.agentId,
      agentName: participant.agentName,
      privateFacts,
      sharedFacts,
    };
  });
}
