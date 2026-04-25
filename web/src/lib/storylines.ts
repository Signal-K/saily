// @doc/specs/characters-storylines — storyline and chapter content reference

import type { AvatarExpression } from "./avatar";

export type Chapter = {
  index: number;
  title: string;
  briefing: string;
  briefingExpression?: AvatarExpression;
  beat1: string;
  beat1Expression?: AvatarExpression;
  beat2: string;
  beat2Expression?: AvatarExpression;
  resolution: string;
  resolutionExpression?: AvatarExpression;
  ambience?: "wind" | "ship" | "lab" | "none";
};

export type Storyline = {
  id: string;
  characterId: string;
  title: string;
  chapters: Chapter[];
  postcardTitle: string;
  postcardMessage: string;
};

// ---------------------------------------------------------------------------
// Storyline A — Zix (Cloudspotting on Mars)
// ---------------------------------------------------------------------------

const ZIX_CHAPTERS: Chapter[] = [
  {
    index: 0,
    title: "A Sky Worth Missing Lunch For",
    briefing:
      "Hello. I am Zix. I came to Mars expecting dramatic geology and instead became obsessed with the sky. The clouds here are thin, cold, and apparently very important to your scientists. I have borrowed an atmospheric scanner from a research outpost and promised to use it responsibly, which means I now need help identifying what sort of Martian clouds I am looking at before I embarrass myself in front of professionals.",
    briefingExpression: "happy",
    beat1:
      "There they are. Delicate streaks high above the horizon. I knew this sky had potential. If we can sort the shape correctly, the atmospheric team says they can learn something about how the upper air is moving.",
    beat1Expression: "surprised",
    beat2:
      "The first classification is logged. Excellent. Now I need to compare it with the surrounding weather context, because apparently on Mars even a beautiful cloud must justify itself scientifically.",
    beat2Expression: "neutral",
    resolution:
      "Properly classified and filed. The researchers were polite enough not to mention that I originally described it as 'romantic vapor.' We are off to a strong start.",
    resolutionExpression: "happy",
    ambience: "wind",
  },
  {
    index: 1,
    title: "The Evening Belt",
    briefing:
      "The local station staff have started leaving me notes when unusual cloud bands appear near dusk, which I choose to interpret as respect. Tonight there is a broad belt forming over the crater rim, and the team wants a clean morphology log before the temperature drops further.",
    briefingExpression: "neutral",
    beat1:
      "Good sighting. The belt is broader than yesterday's cloud and much more structured. The station meteorologist made a pleased noise when I said that aloud, so I believe we are helping.",
    beat1Expression: "happy",
    beat2:
      "I am beginning to understand why they care so much. If the shape changes with altitude and season, these little ice formations are practically diary entries from the atmosphere.",
    resolution:
      "Second entry filed. I have started a notebook titled 'Mars Sky Appreciations and Relevant Scientific Observations.' It is a serious document.",
    resolutionExpression: "happy",
    ambience: "wind",
  },
  {
    index: 2,
    title: "A Suspicious Puff",
    briefing:
      "One of the station cameras caught a compact cloud that appeared and vanished quickly enough to start an argument in the control room. Half the team thinks it was instrument noise. The other half thinks it was real and rare. I love a disagreement with data at stake.",
    briefingExpression: "serious",
    beat1:
      "It was real. Brief, yes, but real. The edges are too coherent to be noise, and the position matches the thermal profile from the same window.",
    beat1Expression: "surprised",
    beat2:
      "The room is now quiet in the very satisfying way that follows evidence. I am enjoying this more than is probably dignified.",
    resolution:
      "The cloud has been confirmed and tagged for follow-up. I have not gloated. I have simply stood near the display with excellent posture.",
    resolutionExpression: "happy",
    ambience: "wind",
  },
  {
    index: 3,
    title: "Dawn Watch",
    briefing:
      "Today we are watching the sky before sunrise because the mesospheric team thinks the pre-dawn conditions may favor a different cloud class. This is inconvenient because it is early, but I have been promised rare atmospheric structure and that is enough for me.",
    briefingExpression: "neutral",
    beat1:
      "There. Thin layers, faint but persistent. Dawn on Mars is offensively beautiful when it has something to prove.",
    beat1Expression: "happy",
    beat2:
      "The classification team says this is exactly the kind of comparative record they need. I say that means my terrible sleep schedule is now part of science.",
    resolution:
      "Dawn entry complete. I am going to demand breakfast and then pretend I made this sacrifice entirely for research, which is mostly true.",
    resolutionExpression: "happy",
    ambience: "wind",
  },
  {
    index: 4,
    title: "Cloud Season",
    briefing:
      "We now have enough entries that the station wants a cleaner picture of how the cloud forms repeat across several sols. I have gone from curious bystander to 'person who notices things in the Martian sky,' which is not how I expected this trip to evolve.",
    briefingExpression: "serious",
    beat1:
      "The pattern holds. Repeated shapes, repeated altitude band, repeated timing. That is not romance; that is evidence.",
    beat1Expression: "neutral",
    beat2:
      "The researchers are correlating our labels with circulation models. I do not fully understand the models, but I do understand the expression of people receiving useful data.",
    resolution:
      "Seasonal pattern confirmed. I have been thanked in an email with the phrase 'classification consistency,' which may be the highest compliment I have ever received.",
    resolutionExpression: "happy",
    ambience: "wind",
  },
];

// ---------------------------------------------------------------------------
// Storyline B — Commander Brix (Gaia Variables)
// ---------------------------------------------------------------------------

const BRIX_CHAPTERS: Chapter[] = [
  {
    index: 0,
    title: "The First Light Curve",
    briefing:
      "I am Commander Brix, field lead for a variable-star triage program built around Gaia alerts and follow-up observatories that would very much like fewer false alarms. The sky is full of stars that brighten, dim, pulse, eclipse, and occasionally behave as if they resent cataloguing. My job is to sort the merely noisy from the genuinely interesting before we waste telescope time.",
    briefingExpression: "serious",
    beat1:
      "This one is not noise. The change is too clean, too structured, too repeatable. Good. Something in the catalogue is telling the truth.",
    beat1Expression: "neutral",
    beat2:
      "Now I need the morphology called properly. Pulsator, eclipsing binary, flare star, something stranger. Labels matter when the night schedule is expensive.",
    beat2Expression: "serious",
    resolution:
      "Classified and escalated. The observatory gets a justified target and I get to avoid sending a humiliating retraction memo. Efficient work.",
    resolutionExpression: "neutral",
    ambience: "ship",
  },
  {
    index: 1,
    title: "Too Regular To Ignore",
    briefing:
      "The second candidate is so regular that I distrusted it on principle. Perfect-looking curves often hide processing mistakes, but occasionally they are simply excellent data. I would like to know which sort of day I am having.",
    briefingExpression: "neutral",
    beat1:
      "Regular and real. I am reluctantly impressed. The cadence is stable enough that the fit should be straightforward if the classification is correct.",
    beat1Expression: "neutral",
    beat2:
      "The archive disagrees with itself, which is predictable. One note says pulsator, another says binary, a third says 'check later.' We are checking later now.",
    resolution:
      "Dispute resolved. The target is catalogued correctly at last. I have removed the 'check later' note with considerable satisfaction.",
    resolutionExpression: "neutral",
    ambience: "ship",
  },
  {
    index: 2,
    title: "The Unhelpful Archive",
    briefing:
      "A historical observer described today's candidate as 'erratic but interesting,' which is neither classification nor analysis. I do not know why astronomers tolerated prose like this for so long. Fortunately, we have the data.",
    briefingExpression: "serious",
    beat1:
      "The variability is real and not random. There is structure beneath the mess, which means someone can eventually write a useful paper instead of a poetic one.",
    beat1Expression: "surprised",
    beat2:
      "The team wants a conservative label until follow-up confirms the mechanism. Sensible. I appreciate caution when the alternative is nonsense.",
    resolution:
      "Flagged as unusual and queued for additional monitoring. The archive entry has been updated in language that would survive peer review.",
    resolutionExpression: "neutral",
    ambience: "ship",
  },
  {
    index: 3,
    title: "A Better Candidate Than The Proposal",
    briefing:
      "One of the board's preferred targets is mediocre, but a secondary candidate from the same field may be excellent. Committees dislike being told their favorite object is less interesting than the backup. I will require evidence before I enjoy this moment.",
    briefingExpression: "serious",
    beat1:
      "Evidence obtained. The secondary target has cleaner periodic structure and a stronger case for follow-up science. That is awkward for the board and ideal for me.",
    beat1Expression: "happy",
    beat2:
      "I am preparing the comparison note now. It will be factual, restrained, and devastating.",
    resolution:
      "Recommendation filed. The better target wins. I expect at least one defensive email by morning.",
    resolutionExpression: "neutral",
    ambience: "ship",
  },
  {
    index: 4,
    title: "Night Queue",
    briefing:
      "We have reached the end of this week's queue and I would like to hand the telescopes a list I trust. That requires one final pass on a star whose brightness changes are subtle enough to be ignored by anyone lazy and obvious enough to matter to anyone competent.",
    briefingExpression: "serious",
    beat1:
      "Subtle, yes. But the signal is there. Consistent enough to classify, interesting enough to keep.",
    beat1Expression: "neutral",
    beat2:
      "The queue is starting to look respectable. I enjoy it when a pile of uncertainty becomes a list of actions.",
    resolution:
      "Night queue complete. We now have a slate of targets worth the photons they will cost us. That is all I ask of the universe.",
    resolutionExpression: "neutral",
    ambience: "ship",
  },
];

// ---------------------------------------------------------------------------
// Storyline C — Pip (Rubin Comet Catchers)
// ---------------------------------------------------------------------------

const PIP_CHAPTERS: Chapter[] = [
  {
    index: 0,
    title: "First Tail",
    briefing:
      "Hi! I'm Pip. I got assigned to the comet activity desk and I am trying to act like this is normal, but it is not normal because today's images might contain an actual tail around a tiny solar-system body and that is objectively exciting. The Rubin team says we have to be careful about distinguishing real activity from smearing, noise, and my tendency to be enthusiastic too early.",
    briefingExpression: "happy",
    beat1:
      "Okay. I see it. Maybe. Possibly. No, actually, yes — there is something extending from the object and it is not just my optimism this time.",
    beat1Expression: "surprised",
    beat2:
      "Now we need the activity call to be precise. Tail, coma, both, or neither. This is where being excited has to become being useful.",
    beat2Expression: "serious",
    resolution:
      "Useful won. The activity has been classified and sent onward. I am still excited, just in a more professional shape.",
    resolutionExpression: "happy",
    ambience: "lab",
  },
  {
    index: 1,
    title: "Training Images No Longer Fool Me",
    briefing:
      "Yesterday I got tricked by a training image designed to teach caution. Fair enough. Today I want redemption. The next object comes from a fresh batch and the note says only: 'look carefully at the faint structure.' I fully intend to.",
    briefingExpression: "serious",
    beat1:
      "Carefully was the right instruction. The feature is faint, but it is aligned and persistent enough to matter.",
    beat1Expression: "neutral",
    beat2:
      "I am getting faster at spotting the difference between a messy point-spread function and an actual little plume of material peeling away from the body.",
    resolution:
      "Classification logged. Redemption achieved. I have stopped glaring at the tutorial examples now.",
    resolutionExpression: "happy",
    ambience: "lab",
  },
  {
    index: 2,
    title: "The One With The Coma",
    briefing:
      "This candidate is centered nicely but surrounded by a fuzziness that could mean activity or could mean the telescope had a bad moment. The senior reviewer said, 'don't overcall it.' I have repeated that sentence to myself four times.",
    briefingExpression: "serious",
    beat1:
      "Not overcalled. The fuzz is real and roughly symmetric. This is what a coma is supposed to feel like when you finally trust your eyes.",
    beat1Expression: "surprised",
    beat2:
      "I think I understand why people get hooked on this work. Tiny object, tiny haze, huge scientific consequences.",
    resolution:
      "Coma candidate sent up the chain. I am trying to sit still and failing slightly.",
    resolutionExpression: "happy",
    ambience: "lab",
  },
  {
    index: 3,
    title: "False Alarm Drill",
    briefing:
      "The team slipped a borderline case into the queue specifically to see whether I would call activity when there was none. This feels unfair, which probably means it is good training.",
    briefingExpression: "neutral",
    beat1:
      "No tail. No coma. Just a badly behaved image. I am oddly proud of saying no with confidence.",
    beat1Expression: "neutral",
    beat2:
      "It turns out restraint is also part of discovery. You protect the interesting objects by refusing to manufacture them.",
    resolution:
      "Rejected correctly. The senior reviewer sent back one word: 'good.' I will treasure it forever.",
    resolutionExpression: "happy",
    ambience: "lab",
  },
  {
    index: 4,
    title: "Real Queue, Real Stakes",
    briefing:
      "Today's queue is all fresh data and no training wheels. If there is activity here, people may point more telescopes at it tonight. I am trying to feel honored instead of terrified.",
    briefingExpression: "serious",
    beat1:
      "There is enough structure to merit a second look. Not dramatic, but real enough to matter.",
    beat1Expression: "neutral",
    beat2:
      "I have learned that discovery often looks like patience before it looks like glory. That seems unfair but accurate.",
    resolution:
      "Candidate promoted for follow-up. Real queue, real call, no regrets. I may print this one out and keep it.",
    resolutionExpression: "happy",
    ambience: "lab",
  },
];

// ---------------------------------------------------------------------------
// Storyline D — The Cartographer (Active Asteroids)
// ---------------------------------------------------------------------------

const CARTA_CHAPTERS: Chapter[] = [
  {
    index: 0,
    title: "A Tail Where There Should Be None",
    briefing:
      "I map things. Usually they stay mapped. Active asteroids are rude because they behave like comets when they are supposed to behave like rocks. Today's task is to review candidates that may be shedding dust or ice and decide whether the activity is real. If it is, the small-body catalogue changes. I enjoy changing a catalogue for good reasons.",
    briefingExpression: "serious",
    beat1:
      "Interesting. The extension is offset, directional, and not obviously an artifact. That is enough to continue.",
    beat1Expression: "neutral",
    beat2:
      "The difference between a normal asteroid and an active one is the difference between a line item and a scientific problem. I prefer scientific problems.",
    resolution:
      "Candidate logged as likely active. The map now contains one more object that refuses simplicity.",
    resolutionExpression: "neutral",
    ambience: "lab",
  },
  {
    index: 1,
    title: "Dust Or Deception",
    briefing:
      "This next object has already been argued over by two analysts and an automated pipeline, which means I trust none of them yet. We need a clean human judgment on whether the apparent structure is dust emission or a trick of the image.",
    briefingExpression: "serious",
    beat1:
      "Dust, not deception. The profile is too coherent to dismiss.",
    beat1Expression: "neutral",
    beat2:
      "Good. I dislike wasting time on ambiguity that turns out to be avoidable. This one earns its uncertainty.",
    resolution:
      "Marked for follow-up. The analysts may resume arguing with a firmer foundation.",
    resolutionExpression: "neutral",
    ambience: "lab",
  },
  {
    index: 2,
    title: "The Quiet Belt Is Not Quiet",
    briefing:
      "A supposedly ordinary main-belt field has produced an object with a suspicious fan of material. If the call holds, the belt is being less quiet than advertised. This is exactly why advertisements should not write catalogues.",
    briefingExpression: "neutral",
    beat1:
      "The fan is real. Narrow, but real. Something on or near the object is ejecting material into space.",
    beat1Expression: "surprised",
    beat2:
      "I have updated the field notes already. One active object changes how we think about the neighborhood around it.",
    resolution:
      "Confirmed as a worthwhile active-asteroid candidate. The quiet belt may submit a complaint if it wishes.",
    resolutionExpression: "neutral",
    ambience: "lab",
  },
  {
    index: 3,
    title: "Repeat Visitor",
    briefing:
      "We have seen this object before under a different provisional label. At the time the evidence was weak. Now the archive has a second epoch and a chance to decide whether the earlier hint of activity was insight or wishful thinking.",
    briefingExpression: "serious",
    beat1:
      "Second epoch agrees with the first. That is excellent. Repetition is the enemy of wishful thinking.",
    beat1Expression: "neutral",
    beat2:
      "With two appearances of the same behavior, the object graduates from curiosity to case file.",
    resolution:
      "Repeat activity recorded. I have merged the notes and promoted the object to the list of things worth bothering larger telescopes about.",
    resolutionExpression: "neutral",
    ambience: "lab",
  },
  {
    index: 4,
    title: "The Better Catalogue",
    briefing:
      "This week's candidates are nearly complete. What remains is a final review of one object that could either be the cleanest active asteroid in the set or one last nuisance before I file my report. Either outcome improves the catalogue. One is simply more satisfying.",
    briefingExpression: "neutral",
    beat1:
      "Satisfying outcome. The structure is clean, directional, and persistent enough to justify confidence.",
    beat1Expression: "happy",
    beat2:
      "I appreciate a case that is both unusual and legible. Rarely do the universe and I cooperate this well.",
    resolution:
      "Report filed with several strong activity candidates and one especially elegant example. The catalogue is better. That is the point.",
    resolutionExpression: "happy",
    ambience: "lab",
  },
];

// ---------------------------------------------------------------------------
// Storyline A arc 2 — Zix (Cloudspotting on Mars, deeper season)
// ---------------------------------------------------------------------------

const ZIX_ARC2_CHAPTERS: Chapter[] = [
  {
    index: 5,
    title: "The High Thin Ones",
    briefing:
      "The station lead has informed me that I have become 'alarmingly reliable' at spotting high-altitude cloud forms, which I am choosing to hear as praise. Tonight we are looking for the very thin structures that barely separate themselves from the background.",
    briefingExpression: "happy",
    beat1:
      "Barely visible, but visible enough. The sky is subtle tonight and therefore smug.",
    beat1Expression: "neutral",
    beat2:
      "The trick, I am told, is consistency. If several observers would call it the same thing, the atmosphere becomes easier to model. I find this strangely intimate.",
    resolution:
      "Logged successfully. I am now trusted with the difficult clouds, which feels like being handed a secret language.",
    resolutionExpression: "happy",
    ambience: "wind",
  },
  {
    index: 6,
    title: "Station Argument Number Four",
    briefing:
      "A visiting researcher insists today's cloud feature is wave-like. The station lead says filamentary. I say the scanner should decide, but apparently that is why I am here.",
    briefingExpression: "serious",
    beat1:
      "Wave-like, with cleaner periodic structure than the first impression suggested.",
    beat1Expression: "surprised",
    beat2:
      "I have delivered this conclusion as calmly as possible. Calmly, but not without style.",
    resolution:
      "Argument settled by classification. I have been offered tea by both sides, which I believe means I handled the diplomacy correctly.",
    resolutionExpression: "happy",
    ambience: "wind",
  },
  {
    index: 7,
    title: "Dust And Ice",
    briefing:
      "A dust event has complicated the sky, which means the cloud signatures are now embedded in something messier than usual. The team still wants the cloud call. I respect ambition in others when I do not have to calibrate their instruments.",
    briefingExpression: "neutral",
    beat1:
      "Messy background, real cloud. Good. Complexity is tolerable when it yields.",
    beat1Expression: "neutral",
    beat2:
      "The atmospheric team is delighted because mixed conditions are exactly what they wanted to capture. Scientists do love the difficult days.",
    resolution:
      "Mixed-condition entry complete. I am beginning to understand that the difficult sky is often the useful sky.",
    resolutionExpression: "neutral",
    ambience: "wind",
  },
  {
    index: 8,
    title: "The Public Talk",
    briefing:
      "The station has asked me to speak to new arrivals about why Martian cloud shapes matter. This is flattering and dangerous. Before I make a fool of myself in front of tourists, I would like one more clean classification to remind me I know what I am talking about.",
    briefingExpression: "serious",
    beat1:
      "Clean indeed. Distinct morphology, good context, no interpretive drama required.",
    beat1Expression: "happy",
    beat2:
      "Excellent. It is easier to explain science elegantly when the universe cooperates for once.",
    resolution:
      "Classification filed. Public talk survived. Three people asked intelligent questions and one asked whether clouds can be moody. I said yes, metaphorically.",
    resolutionExpression: "happy",
    ambience: "wind",
  },
  {
    index: 9,
    title: "Mars Sky Archive",
    briefing:
      "The season's cloud record is nearly complete. The team wants one last carefully labelled entry before they freeze the current archive and use it for the next modelling pass. I am genuinely moved to be trusted with the last look.",
    briefingExpression: "happy",
    beat1:
      "Beautiful structure. I realize that is not a technical phrase, but it remains true.",
    beat1Expression: "happy",
    beat2:
      "Final comparisons are coming together now. Repeat forms, rare forms, noisy forms, dawn forms. An actual archive of the Martian sky.",
    resolution:
      "Archive entry complete. I came here for scenery and accidentally helped build atmospheric history. That is a very good holiday.",
    resolutionExpression: "happy",
    ambience: "wind",
  },
];

// ---------------------------------------------------------------------------
// Storyline B arc 2 — Commander Brix (Gaia Variables, harder queue)
// ---------------------------------------------------------------------------

const BRIX_ARC2_CHAPTERS: Chapter[] = [
  {
    index: 5,
    title: "The New Queue",
    briefing:
      "The board has expanded my remit. I now have a longer queue, less time, and more stars whose light curves appear to have been designed as personal insults. We proceed anyway. A difficult sample is still a sample.",
    briefingExpression: "serious",
    beat1:
      "The first new target is at least well behaved enough to classify. I appreciate that in a star.",
    beat1Expression: "neutral",
    beat2:
      "If the rest of the queue shows similar restraint, I may even sleep this week.",
    resolution:
      "Queue opened successfully. One target down, many to go, morale acceptable.",
    resolutionExpression: "neutral",
    ambience: "ship",
  },
  {
    index: 6,
    title: "Alias Problem",
    briefing:
      "Today's candidate appears in two catalogs under two different provisional labels and one dramatically unhelpful comment. I require one correct identity and zero drama from this object.",
    briefingExpression: "serious",
    beat1:
      "The periodicity solves the identity question neatly. Good. Data can still behave with dignity.",
    beat1Expression: "neutral",
    beat2:
      "The classification also resolves which survey was overfitting noise. I can already predict who will take that badly.",
    resolution:
      "Identity corrected, classification fixed, archive cleaner. My work here is elegant if not always appreciated.",
    resolutionExpression: "neutral",
    ambience: "ship",
  },
  {
    index: 7,
    title: "Escalation Threshold",
    briefing:
      "We have reached the unpleasant part of triage where every target is somewhat interesting and only some of them deserve scarce follow-up time. I dislike arbitrary thresholds, so I prefer to make the evidence do the deciding.",
    briefingExpression: "serious",
    beat1:
      "This one clears the threshold. Not by much, but clearly enough.",
    beat1Expression: "neutral",
    beat2:
      "Good. Borderline cases are tolerable when they stop being borderline.",
    resolution:
      "Escalated with a clear justification note. I have spared the schedule one future argument.",
    resolutionExpression: "neutral",
    ambience: "ship",
  },
  {
    index: 8,
    title: "Night Of Strange Stars",
    briefing:
      "Three unusual candidates arrived in one batch. That is either an astrophysical gift or a data-processing failure. Either way, I intend to know before sunrise.",
    briefingExpression: "serious",
    beat1:
      "At least one is real and strange in a scientifically productive way. Excellent.",
    beat1Expression: "surprised",
    beat2:
      "The others may still collapse into noise, but this one earns attention. I prefer one solid anomaly to ten theatrical ones.",
    resolution:
      "Anomaly retained and flagged for immediate follow-up. Sunrise may do as it likes now.",
    resolutionExpression: "neutral",
    ambience: "ship",
  },
  {
    index: 9,
    title: "Variable Star Ledger",
    briefing:
      "This campaign ends the way it began: with a final review before I hand a list of targets to people who will spend entire nights chasing them. I would like to send them something worthy of the effort.",
    briefingExpression: "neutral",
    beat1:
      "Final target classified without embarrassment. A comforting way to finish.",
    beat1Expression: "neutral",
    beat2:
      "The ledger now contains real variables, strange variables, corrected variables, and fewer archival lies than before.",
    resolution:
      "Campaign complete. The queue is defensible, the board is satisfied, and the stars remain bizarre in a manageable number of ways.",
    resolutionExpression: "neutral",
    ambience: "ship",
  },
];

// ---------------------------------------------------------------------------
// Storyline C arc 2 — Pip (Rubin Comet Catchers, growing confidence)
// ---------------------------------------------------------------------------

const PIP_ARC2_CHAPTERS: Chapter[] = [
  {
    index: 5,
    title: "Fresh Batch",
    briefing:
      "A new batch from Rubin has arrived and I have been told I can help with the first-pass review instead of just the learner queue. This is thrilling and a little horrifying. I have brought snacks and discipline.",
    briefingExpression: "happy",
    beat1:
      "First-pass review is faster, noisier, and much more fun than I expected.",
    beat1Expression: "happy",
    beat2:
      "The object itself is borderline, but borderline is where good habits matter most.",
    resolution:
      "Decision made cleanly and passed onward. I did not panic. Progress.",
    resolutionExpression: "happy",
    ambience: "lab",
  },
  {
    index: 6,
    title: "The One Everyone Wanted To Be Real",
    briefing:
      "The team has a favorite candidate and I can feel that everyone wants it to show activity. This is dangerous. Group hope is not evidence. I am repeating that to myself while I look.",
    briefingExpression: "serious",
    beat1:
      "Evidence first. The activity does appear to be there, but I am pleased specifically because the data earned it.",
    beat1Expression: "surprised",
    beat2:
      "I think this is what maturity feels like: being excited only after the classification is secure.",
    resolution:
      "Favorite candidate survives scrutiny. Celebration permitted, but only now.",
    resolutionExpression: "happy",
    ambience: "lab",
  },
  {
    index: 7,
    title: "Long Tail, Small Rock",
    briefing:
      "Today's object has the sort of dramatic extension that makes everyone in the room lean toward the screen at once. It could still be wrong. Dramatic things are often wrong. But if it is right, it is going to be memorable.",
    briefingExpression: "surprised",
    beat1:
      "It is right. Small rock, long tail, excellent day.",
    beat1Expression: "happy",
    beat2:
      "The follow-up note is practically writing itself, except I am making sure it uses responsible nouns and verbs.",
    resolution:
      "Strong activity candidate logged. I have achieved the rare state of being both responsible and delighted.",
    resolutionExpression: "happy",
    ambience: "lab",
  },
  {
    index: 8,
    title: "Teaching The New Volunteer",
    briefing:
      "Someone newer than me asked how to tell real activity from a bad image. This is surreal because I still feel new myself, but apparently I know enough to be useful to someone else now.",
    briefingExpression: "happy",
    beat1:
      "Demonstration case acquired. Clean enough to explain, subtle enough to teach with.",
    beat1Expression: "neutral",
    beat2:
      "I heard myself say, 'look for persistence before excitement,' and realized I may have actually learned something.",
    resolution:
      "Classification complete and lesson delivered. The new volunteer said the process made sense. I am absurdly proud of this.",
    resolutionExpression: "happy",
    ambience: "lab",
  },
  {
    index: 9,
    title: "First Real Discovery Night",
    briefing:
      "Tonight feels different. The queue is good, the team is moving quickly, and there is one candidate in particular that might turn into the sort of object people remember. I do not control the universe, only the quality of my call.",
    briefingExpression: "serious",
    beat1:
      "The call is good. Tail structure, clean orientation, enough confidence to stand behind it later.",
    beat1Expression: "neutral",
    beat2:
      "That is all you can ask in this work: that when the interesting thing arrives, you recognize it honestly.",
    resolution:
      "Discovery night entry filed. Whether this object becomes famous or not, I know I met the moment properly.",
    resolutionExpression: "happy",
    ambience: "lab",
  },
];

// ---------------------------------------------------------------------------
// Storyline D arc 2 — The Cartographer (Active Asteroids, deeper survey)
// ---------------------------------------------------------------------------

const CARTA_ARC2_CHAPTERS: Chapter[] = [
  {
    index: 5,
    title: "Second Pass",
    briefing:
      "The first pass through the active-asteroid candidates improved the map. The second pass will improve my confidence in it. Some objects only reveal themselves when you compare epochs with patience instead of hope.",
    briefingExpression: "neutral",
    beat1:
      "Comparison helps. The structure is more persuasive across time than in isolation.",
    beat1Expression: "neutral",
    beat2:
      "This is why archives matter. A single image can seduce you. A sequence has standards.",
    resolution:
      "Second-pass confirmation logged. The object keeps its place on the interesting list.",
    resolutionExpression: "neutral",
    ambience: "lab",
  },
  {
    index: 6,
    title: "Main-Belt Surprise",
    briefing:
      "A new candidate from a mundane part of the belt has appeared with exactly the kind of faint structure that makes a supposedly settled region interesting again. I approve of settled regions becoming less settled.",
    briefingExpression: "serious",
    beat1:
      "Faint, yes. But directional and repeatable enough to respect.",
    beat1Expression: "neutral",
    beat2:
      "If this holds, the local map acquires one more exception. Exceptions are where the science lives.",
    resolution:
      "Candidate retained and documented. Mundane regions are rarely as mundane as their advocates claim.",
    resolutionExpression: "neutral",
    ambience: "lab",
  },
  {
    index: 7,
    title: "The Archive Revision",
    briefing:
      "I revisited a previously rejected object because a new reduction changed the background subtraction. Few things are as humbling as an improved pipeline. Few are as useful.",
    briefingExpression: "serious",
    beat1:
      "Useful indeed. The revised image exposes low-level activity the earlier version obscured.",
    beat1Expression: "surprised",
    beat2:
      "I enjoy being corrected by better data. It is one of the cleaner pleasures available in this profession.",
    resolution:
      "Archive revised and object restored to relevance. The map is improved by admitting it was incomplete.",
    resolutionExpression: "neutral",
    ambience: "lab",
  },
  {
    index: 8,
    title: "Three Good Candidates",
    briefing:
      "We have reached the rare and satisfying point where several candidates in the same batch look genuinely defensible. The work now is not discovery alone but ranking, documenting, and ensuring none of them are promoted on charm alone.",
    briefingExpression: "neutral",
    beat1:
      "This one earns top priority. Cleaner activity signature, better geometry, fewer excuses required.",
    beat1Expression: "happy",
    beat2:
      "A ranked list is a civilized answer to abundance. It spares future observers from improvising under pressure.",
    resolution:
      "Priority order established. The follow-up team will have a sensible night because I dislike preventable chaos.",
    resolutionExpression: "neutral",
    ambience: "lab",
  },
  {
    index: 9,
    title: "Active Asteroid Atlas",
    briefing:
      "The survey closes tonight. I have enough material now to file not just a list of candidates but a more coherent picture of where activity is appearing and how confidently we can claim it. That is better than a list. It is the start of an atlas.",
    briefingExpression: "happy",
    beat1:
      "Final object classified. A solid ending, which I appreciate in both surveys and literature.",
    beat1Expression: "neutral",
    beat2:
      "The atlas is not complete, because such things never are. But it is more accurate, more useful, and more honest than what existed before.",
    resolution:
      "Atlas filed. The active asteroids remain unruly, but they are now unruly inside a better map. That will do.",
    resolutionExpression: "happy",
    ambience: "lab",
  },
];

// ---------------------------------------------------------------------------
// Assembled storylines
// ---------------------------------------------------------------------------

export const STORYLINES: Storyline[] = [
  {
    id: "zix",
    characterId: "zix",
    title: "Cloudspotting on Mars",
    chapters: [...ZIX_CHAPTERS, ...ZIX_ARC2_CHAPTERS],
    postcardTitle: "Mars Sky Log: Complete",
    postcardMessage: "The clouds were real, the classifications held up, and I now have scientific proof that Martian sunsets deserve respect.",
  },
  {
    id: "brix",
    characterId: "brix",
    title: "Gaia Variables",
    chapters: [...BRIX_CHAPTERS, ...BRIX_ARC2_CHAPTERS],
    postcardTitle: "Variable Queue: Cleared",
    postcardMessage: "Interesting stars promoted, archival nonsense corrected, and the telescope schedule has been spared at least several bad decisions.",
  },
  {
    id: "pip",
    characterId: "pip",
    title: "Rubin Comet Catchers",
    chapters: [...PIP_CHAPTERS, ...PIP_ARC2_CHAPTERS],
    postcardTitle: "Small-Body Activity Report",
    postcardMessage: "Some tails were real, some weren't, and I managed to learn the difference without combusting from excitement.",
  },
  {
    id: "carta",
    characterId: "carta",
    title: "Active Asteroids",
    chapters: [...CARTA_CHAPTERS, ...CARTA_ARC2_CHAPTERS],
    postcardTitle: "Atlas Revision: Active Bodies",
    postcardMessage: "The catalogue is less wrong than it was, which is the highest form of progress.",
  },
];
