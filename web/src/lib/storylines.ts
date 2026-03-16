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
};

// ---------------------------------------------------------------------------
// Storyline A — Dr. Mara Chen (thriller)
// ---------------------------------------------------------------------------

const MARA_CHAPTERS: Chapter[] = [
  {
    index: 0,
    title: "Forty-Eight Hours",
    briefing:
      "I'm a scientist. I deal in evidence, and right now the evidence says I have maybe two days before they find this terminal. Three weeks ago I flagged something in the TESS pipeline — a signal that shouldn't exist in the data. I reported it up the chain. Forty-eight hours later my clearance was revoked and someone had been through my flat. I don't know who else saw what I saw. I don't know if I'm the first. What I know is I need a planet — somewhere outside the mapped routes, somewhere quiet. The transit data is right in front of us. Help me find it.",
    briefingExpression: "serious",
    beat1:
      "That dip is real. I've been reading light curves for ten years and that's not instrument noise. We have a candidate. Now I need fuel for the trip — there's an asteroid cluster on this heading. Let's see what's actually out there.",
    beat1Expression: "surprised",
    beat2:
      "Water-ice confirmed. I heard a name once, through a mutual contact — Torres. Someone else who got too close to something. I don't know if he made it out. I'm going to assume he did. Now let's look at what we're actually landing on.",
    beat2Expression: "serious",
    resolution:
      "A viable surface. I'm going to sit here for a moment and just look at that image. An actual place. I've been running for so long I forgot I was running toward something. Thank you. Genuinely. I'll make contact again when I'm down.",
    resolutionExpression: "happy",
    ambience: "ship",
  },
  {
    index: 1,
    title: "Closer Than I Thought",
    briefing:
      "They found my last terminal. Not the data — I moved that — but they found the physical location within six hours of my last session. That's faster than I expected. Someone in the network is feeding them information. I'm routing through a different relay now. I still have the candidate planet but I need to verify the approach corridor. There may be interference on the route I was planning. I need fresh transit data — something I haven't had eyes on yet. Can you help me look?",
    beat1:
      "Clean signal. The approach corridor looks viable. I've been going over the manifest I found before all of this started — the one that triggered everything. There are other names on it. I'm not sure what to do with that yet. First things first. Asteroid cluster — let's check the water situation on the new heading.",
    beat2:
      "There's enough out here. More than enough. I keep thinking about the other names on that manifest. One of them was a botanist — Osei, I think. I wonder if she knows what she's sitting on. I wonder if she's safe. Surface scan next.",
    resolution:
      "Every scan I see, I believe in this a little more. I'm still scared — I'm not going to pretend otherwise — but the fear is starting to feel like something I can use rather than something that's using me. One more day closer.",
  },
  {
    index: 2,
    title: "The Manifest",
    briefing:
      "I've had time to go through the full document now. It's worse than I thought — and I thought it was bad. What I found in the TESS data isn't just a signal. It's a response. Something answered a deep-field probe that went out eleven years ago and the people running this programme knew about it and buried it completely. The planet I'm heading to is in the same region. I don't think that's a coincidence anymore. I need to know more about what's out there before I arrive. Fresh transit data, fresh eyes. Are you with me?",
    beat1:
      "There's something structured about the way these signals cluster. I keep telling myself I'm pattern-matching on nothing, that scientists do this — see what they want to see. But I've run the analysis three times. Something is happening out there. Let's find water and then I want to look at that surface very carefully.",
    beat2:
      "The asteroid data feels almost routine now. We've gotten good at this. I want to tell someone what I've found. I keep stopping myself. Not yet. Surface scan first. I want to see it with fresh data.",
    resolution:
      "I'm looking at the surface image alongside the signal analysis. I don't have proof yet — I need to be on the ground for proof. But I think whatever answered that probe eleven years ago is still there. And I'm the only person currently flying toward it who isn't trying to suppress it. That's either very exciting or very dangerous. Probably both.",
  },
  {
    index: 3,
    title: "Four Days Out",
    briefing:
      "Four days out from the target. The people looking for me have broadened the search — I've seen fragments of comms traffic suggesting they've widened to a sector-level sweep. They still don't know exactly where I'm going, but the window is narrowing. I need everything I can get on the approach — alternative transit routes, fuel stops, anything. I can't afford a wrong turn at this point. The data will tell us if there's a cleaner path in. I'm trusting you with this.",
    beat1:
      "That's a safer corridor. Longer but safer — I'll take it. I've been thinking about what happens when I arrive. I have evidence. I have a location. What I don't have is anyone who will listen. Yet. Asteroid — let's keep moving.",
    beat2:
      "I've been awake for thirty-one hours. The asteroid data helps somehow — there's something grounding about looking at real physical things when everything else feels abstract and enormous. Surface next, and then I need to sleep.",
    resolution:
      "That surface is beautiful. I don't say that about data usually. I say it about results, about elegant proofs. But that image — whatever is out there — it's beautiful. Three more days. I'm going to sleep now. For the first time in weeks, I think I actually can.",
  },
  {
    index: 4,
    title: "Landing",
    briefing:
      "I'm in the final approach window. This is the last session before I go dark for the landing sequence — the communications array has to come offline during descent. I've been thinking about what I want to say. The honest answer is: I'm not sure I'd have made it here without someone on the other end of this terminal. The galaxy is very large and I was very scared. Finding that planet, the water, verifying the surface — it sounds like data work, and it is, but it's also something else. It's the reason I'm still going. One last look before I land. I want to see it clearly.",
    beat1:
      "Still there. Still real. I keep checking like it might have disappeared. It hasn't. The asteroid data feels like an old friend now — I know what I'm looking at, I know what's worth stopping for. Let's do the surface one last time.",
    beat2:
      "Last surface scan before descent. I want to remember this — the moment before you arrive somewhere, when it's still possibility rather than fact. Although I suppose what I found in that signal makes it something more than possibility already.",
    resolution:
      "That's the whole picture. I'm going in. If anyone ever reads the research I'm about to do down there — if it ever gets out — just know it started here, in a borrowed terminal, with someone helping me find a patch of sky worth flying toward. Wish me luck. I think I'll be okay.",
  },
];

// ---------------------------------------------------------------------------
// Storyline B — Kai Voss (mystery / lighter)
// ---------------------------------------------------------------------------

const KAI_CHAPTERS: Chapter[] = [
  {
    index: 0,
    title: "Mum's Coordinates",
    briefing:
      "Okay so. My mum was an astronomer — kind of obsessed, honestly, in the best possible way. She died in October. I'm still figuring out how to exist around that. In her will, between the flat and the car and a truly embarrassing number of sticky notes, she left me a set of coordinates and a note that says 'find it before they do.' Classic Mum. Very dramatic, zero explanation. A woman from a company called Vela showed up three days later asking very politely whether I had any of her research files. I told her no. I lied. So now I'm here, looking at light curve data and trying to understand what she spent twenty years looking at. I think she'd find this funny. Will you help me figure out what she found?",
    beat1:
      "Oh. Oh, that's actually there. Mum, you absolute — okay. Right. There's something at those coordinates. I need to figure out how to reach it without dying, which apparently starts with finding water. She had notes about asteroids too — I thought they were just doodles.",
    beat2:
      "She wasn't doodling. She was mapping water sources along a route. She planned this. She actually planned this whole thing and left me the pieces. I'm going to have to have a fairly significant emotion about that at some point but right now let's look at the surface.",
    resolution:
      "That's real. That's a real place with a real surface and my mum spent twenty years pointing at it from our back garden. I'm going to go there. I have no idea what I'm doing but I'm going to figure it out. She believed I could. That has to count for something.",
  },
  {
    index: 1,
    title: "Vela",
    briefing:
      "The woman from Vela came back. This time with a colleague and a document that uses the phrase 'intellectual property' about forty times. They want Mum's research. I said I'd think about it. I'm thinking: absolutely not, but I need more time before I can actually do anything about that. I've been going through her files properly now. She cross-referenced her coordinates with transit data from a Dr. Chen — I don't know who that is, but Mum flagged her work about six months before she died. Someone else was looking at the same region of sky. That makes me feel less like I've imagined all of this. Can we keep looking?",
    beat1:
      "There's definitely something systematic about what she was tracking. This wasn't idle curiosity — she was building a map. The asteroid data is next. She had specific ones annotated. I want to know why those ones.",
    beat2:
      "Those specific asteroids are on the direct route to the coordinates. She was planning a path. She was planning to go herself, I think. And then she didn't. Surface data — let's see what she was planning to land on.",
    resolution:
      "I've been sitting here looking at this surface image and thinking about the last time I talked to her. We argued about something completely stupid. I can't even remember what. I wish I could tell her I found it. I think she knew I would.",
  },
  {
    index: 2,
    title: "The Route",
    briefing:
      "I've figured out how to access the archive Mum left. It was password-protected with my birthday — of course it was — and it's enormous. Years of observation logs, annotation sets, correspondence with other scientists. One correspondent is listed as 'A.T.' — I have no idea who that is yet. Another reference matches the Chen work I found before. Mum wasn't working alone. She was building something. I need to understand the route better before I can follow it. The transit data she flagged most recently is the place to start.",
    beat1:
      "She was right about this corridor. All her annotations check out. I've started thinking of the data sessions as — I don't know, like she's still here somehow? Teaching me. That probably sounds weird. Asteroid check next.",
    beat2:
      "Her asteroid notes are incredibly detailed. She had fuel calculations done. She thought about everything. The surface is what she was most excited about, based on the logs — there's a whole folder just for surface speculation.",
    resolution:
      "I found her surface notes. She wrote: 'if it looks like I think it does, it will be the most important discovery since we first looked up.' She was never understated. But looking at this data — looking at this actual surface — I think she might have been right.",
  },
  {
    index: 3,
    title: "A.T.",
    briefing:
      "I found out who A.T. is. Commander Atlas Torres — or he was a Commander until about eight months ago. There are fragments online, heavily redacted, about some kind of disciplinary incident. Military. Mum was in contact with him in the last year of her life. I don't know what to make of that. What I do know is that Vela has escalated — they've sent a legal notice to the estate and my aunt is asking questions I don't know how to answer. I need to move faster. The data will help me plan the actual departure.",
    beat1:
      "If Torres is out there somewhere following the same route, I might not be as alone as I thought. That's a strange comfort given that I've never met him. Asteroid next — I need to finalise the fuel stop.",
    beat2:
      "Fuel stop confirmed. I've packed what I can. I've told my aunt I'm going travelling. She'll worry. She'll be fine eventually. I can't explain this to her right now. Surface scan — one more look at where I'm going.",
    resolution:
      "I keep looking at that surface and thinking: that's where Mum wanted to go. And now I'm going instead. For her, but also — I'm realising — for myself. Because she taught me to look up, and once you do that, you can't really stop.",
  },
  {
    index: 4,
    title: "Departure",
    briefing:
      "I'm leaving tonight. I've got Mum's route, her fuel calculations, her observation logs, and the coordinates she spent twenty years refining. I also have absolutely no formal training in space travel, a second-hand navigation system, and the knowledge that at least two other people are probably heading to the same place for completely different reasons. Mum's note said 'find it before they do.' I've been thinking about who 'they' is. I don't think she meant Vela. I think she meant: find it before fear finds you. One last data check before I go. I want to do it properly.",
    beat1:
      "That signal is still there. Still steady. Whatever it is, it's patient. So am I — I'm my mother's child. The asteroid — one more time.",
    beat2:
      "Everything checks out. I've run these numbers so many times they feel like breathing now. Surface one more time, and then I'm going.",
    resolution:
      "That surface. I'm going to land there and somewhere in what I find is going to be the thing my mum spent her whole career reaching toward. I'm terrified. I'm absolutely going. Those two things turn out to be very compatible. See you on the other side.",
  },
];

// ---------------------------------------------------------------------------
// Storyline C — Commander Atlas Torres (serious / dry)
// ---------------------------------------------------------------------------

const ATLAS_CHAPTERS: Chapter[] = [
  {
    index: 0,
    title: "Clean Break",
    briefing:
      "I'm not going to give you context. What I'll tell you is this: I have a ship with a fuel leak, six days of rations, and the kind of trouble behind me that doesn't negotiate. I've been watching TESS data on this terminal for three weeks because the routes I know are watched and I need somewhere new. There's a signal in the data that keeps coming back to me — someone flagged something similar about six months ago, a researcher named Chen. I don't know what happened to her. Either way her instincts look right to me. I need to know if this planet is real before I burn my last fuel heading toward it.",
    beat1:
      "Real. The signal is real. I've spent long enough reading terrain to know when something's actually there. Fuel is the problem now — I've got a heading but not enough to reach it clean. Asteroid cluster on the approach. Let's see what we're working with.",
    beat2:
      "That'll do. A good fuel stop is the difference between a plan and a wish. Surface next. I need to know what I'm landing on before I commit.",
    resolution:
      "Solid ground. Actual solid ground I can put boots on. I've been sleeping in a cockpit for eleven days. I'm going to sit with that image for a moment. Then I'm going to fix the fuel leak and go.",
  },
  {
    index: 1,
    title: "Contact",
    briefing:
      "The people looking for me have a name for what I did. Desertion. I prefer to think of it as a unilateral reassessment of the mission parameters. Six years of service, three tours, two commendations. Then I saw the manifest. Then I saw what the whole thing was actually for. I walked. I'd walk again. What I need now is a route that doesn't intersect with any jurisdiction that has a reason to know my name. The transit data will tell us if this corridor is clear. Keep it practical. I prefer practical.",
    beat1:
      "Clear corridor. We're looking at this methodically and it's paying off. I've heard there's someone else going off-grid in this direction — a scientist of some kind. I'm not inclined to make contact but it's useful to know I'm not the only person who's decided the mapped routes aren't worth the cost. Asteroid check.",
    beat2:
      "Every fuel stop confirmed makes this more real. I've been in situations where the plan looks good until it doesn't. This one keeps looking good. Surface.",
    resolution:
      "I've landed on worse. I've landed on better. What this has is distance, and right now distance is everything. Eleven days and I'm there. I can fix the leak properly and then figure out what comes next.",
  },
  {
    index: 2,
    title: "The Manifest",
    briefing:
      "I've been carrying a copy of the document that ended my career. I've read it so many times I could recite it. Three resource companies, two government departments, one very expensive and very secret extraction contract for asteroid belt mining rights. The war I fought in. The people I served with. All of it manufactured, top to bottom, to create legal justification for a land grab most people will never hear about. I'm not angry anymore. I was, for a while. Now I'm just very clear about what kind of people are behind me. Which means I need to be very clear about what's ahead. Transit data. Let's make sure the heading is still good.",
    beat1:
      "Still good. I've been thinking about the other people on this route. The scientist — Chen, if it's who I think it is — she found something in the data that connects to all of this. I don't know what. I'm not sure I want to. I just want to find somewhere they don't have jurisdiction. Asteroid.",
    beat2:
      "Clean water source confirmed. I keep the manifest because I think it matters that someone knows. Even just one person, out past the mapped routes, who knows what actually happened. Surface check.",
    resolution:
      "A good surface. Not too much radiation, decent gravity signature, no obvious extraction value — the last one is important, believe me. If it looks boring to a mining survey, it looks perfect to me.",
  },
  {
    index: 3,
    title: "Eleven Days",
    briefing:
      "Eleven days out. The fuel leak is worse than I thought — I've patched it twice but the hull stress means I can't fully seal it without proper equipment. I'm losing fuel at about four percent per day. The math works out, barely. There's no margin for a detour. I need the direct route confirmed and I need the fuel stop locked in. I'm going to need precise data. If the asteroid check comes up short, I'm in trouble. Let's do this carefully.",
    beat1:
      "The route holds. I've been careful my whole career. Careful kept me alive in places where careless people died. Careful is why I saw the manifest before I followed the orders it was based on. Careful is, apparently, also what I'm doing now in deep space with a leaking fuel tank. Asteroid. Let's be careful.",
    beat2:
      "Margin confirmed — just. I'll take it. Surface check, and then I'm going to sleep for eight hours and wake up four days closer to the end of all this.",
    resolution:
      "Every surface check makes the landing feel more real. I've been trying not to think about what I actually do when I get there. Survive, I suppose. Figure out the rest after. I've always been better at the immediate problem. Right now the immediate problem is almost solved.",
  },
  {
    index: 4,
    title: "Arrival",
    briefing:
      "Four days out. The leak is stable — I think. The rations are down to two days' worth but I'll land before they run out. I've been thinking about what I'm going to do when I get there. In the service, everything had a next step — orders, objectives, chains of command. Out here it's just me and a destination and the reasons I'm going to it. That's a strange kind of freedom. I'm not sure I'd have used that word six months ago. One last data check before descent. I want to make sure I have everything I need.",
    beat1:
      "Everything checks out. I've been going back through the transit data from the first session. I don't know if Chen made it. I don't know if the botanist did — the one broadcasting plant taxonomy from somewhere in this sector. But I think they did. I think people who pay this much attention to the data tend to get where they're going. Asteroid — last check.",
    beat2:
      "All confirmed. Four days is a long time to think. I've been thinking that if I get to the surface and find something unexpected, I'm going to write it down. Everything I know. All of it. Leave it somewhere. Just in case. Surface.",
    resolution:
      "There it is. That's where I'm going. After everything. After the tour and the manifest and eleven days in a leaking ship — there it is. I'll tell you this for free: it looks worth it. It looks completely worth it.",
  },
];

// ---------------------------------------------------------------------------
// Storyline D — Dr. Yara Osei (warm / purposeful)
// ---------------------------------------------------------------------------

const YARA_CHAPTERS: Chapter[] = [
  {
    index: 0,
    title: "Seventeen Thousand",
    briefing:
      "In the cargo bay behind me there are 17,412 seed species, 6,000 fungal cultures, and enough frozen genetic material to restart most of what makes Earth worth living on. I've been collecting for thirty years. My colleagues think I've gone too far. Perhaps they're right. But I watched the last wild Wollemia nobilis die in a heatwave last spring and I thought: not again. Not one more. So yes, I'm leaving. I need somewhere with stable light, liquid water, and a growing season of reasonable length. That isn't much to ask from a universe this large. The transit data will show us what's out there. Shall we look?",
    beat1:
      "Oh, that's a lovely orbital period. Stable star, reasonable distance — the light levels should be workable for most of what I've brought. Now water. I'm not going all this way to find out the asteroid field is dry rock.",
    beat2:
      "More than enough water. I've started germination tests on the hardiest specimens — I want to know what I'm working with before I land. Surface next. I want to see the terrain.",
    resolution:
      "Good drainage. I can work with that. I've been talking to the seeds — I know that sounds eccentric, but the research on plant response to sound is quite solid. I've been telling them where we're going. I think they're ready.",
  },
  {
    index: 1,
    title: "Something Unexpected",
    briefing:
      "I picked up a signal three days into the journey. Faint, structured — not natural interference. Someone else is out here, or was recently. I've been tracking it passively and trying not to read too much into it. One of my research contacts mentioned, before I left, that a scientist named Chen had gone missing after flagging something unusual in TESS data. I don't know if there's a connection. I'm choosing not to worry about it and instead to focus on what I can actually do, which is navigate carefully and check the data. The transit information will help me verify I'm still on the right route.",
    beat1:
      "Still on course. The signal has faded — whatever it was, it's moved on or gone quiet. I've been repotting some of the more anxious specimens. There's a Corpse Flower in bay three that I think is responding to the vibration of the engines. It's bloomed twice. I've taken it as a good sign. Asteroid check next.",
    beat2:
      "Plenty of water. The Corpse Flower is definitely blooming in response to something. I've decided to call it a good omen. Surface — let's see what kind of soil we're dealing with.",
    resolution:
      "Mineral-rich. I'm practically euphoric. Do you know how long it's been since I've seen data like this? The pH will need adjusting for some of the more particular species but the baseline is extraordinary. I'm going to have so much work to do when I land. I cannot wait.",
  },
  {
    index: 2,
    title: "The Broadcast",
    briefing:
      "I've been broadcasting. I know that might seem reckless given the signals I've picked up, but I've been transmitting plant taxonomy data on a low frequency — partly as a beacon for other travellers, partly because the act of naming things clearly helps me think. My old professor used to say that taxonomy is an act of love: to see something precisely enough to name it is to take responsibility for it. I've named 17,412 things. That feels like enough responsibility to be getting on with. Transit data today — I want to verify the secondary approach corridor.",
    beat1:
      "The secondary corridor is clear. I received a fragment of a response to my broadcast — just static with a structure to it, might be nothing, might be someone else being careful about what they transmit. I understand that impulse. I've sent the moss taxonomy in response. If they're a scientist, they'll find it soothing. Asteroid next.",
    beat2:
      "All the water I'll need, and then some. I've been thinking about the response signal. It felt deliberate. Like someone who wanted to acknowledge they'd heard without giving away their position. Surface scan.",
    resolution:
      "I want to show this surface to every person who told me this was too far, too much, too late. Look at it. There it is. Waiting. All it needed was someone to show up.",
  },
  {
    index: 3,
    title: "Forty Days",
    briefing:
      "Forty days of travel. The seeds are doing remarkably well — I've had germination tests running the whole time, trying to identify which species will need the most acclimatisation. The answer is: all of them, but gradually, with patience. I've been thinking that the work on the surface will take years before I see anything like the ecosystems I left behind. That's fine. I brought enough to work with for decades. What I need now is to make sure I'm landing in the right place. The transit data will confirm the final approach.",
    beat1:
      "Confirmed. I've been thinking about the other travellers out there — the structured signals, the fragments of broadcast. I hope they're all right. I hope they find what they're looking for. There's room out there for all of us. That's the whole point of having a universe this size. Asteroid — last water check.",
    beat2:
      "More than enough. I've started laying out the landing plan — bay sequence, deployment order, initial soil preparation. I've done this in my head a hundred times. It's almost strange to be doing it for real. Surface — one last look.",
    resolution:
      "I've been looking at that surface for forty days in my imagination. The real data is better. That's not always true of things you've imagined for a long time, but it's true here. I'm going to land, and I'm going to start with the mosses, and I'm going to name everything I find.",
  },
  {
    index: 4,
    title: "First Landing",
    briefing:
      "Tomorrow. I land tomorrow. The cargo manifest is finalised — loading order, quarantine protocols, initial deployment sequence. I've checked it four times and I'm going to check it twice more because that's who I am. The seeds are in their final pre-landing dormancy. The fungi are stable. I've written letters to my colleagues, the ones who thought this was too far — not accusatory, just descriptive. This is what I found. This is where I'm going. I thought you should know. One last full data check before descent. I want to do it with proper attention.",
    beat1:
      "I want to remember this signal. This specific configuration of transit data that says: here, this one, this is the one. Twenty years ago I would have filed this and moved on to the next survey. Now it means I know where home is going to be. Asteroid — last time.",
    beat2:
      "The last water check before landing. I've been doing these every session for months now and they never stop feeling important. Every resource confirmed is another thing the seeds will have when they need it. Surface — one final look.",
    resolution:
      "There it is. Tomorrow I'll be standing on it. I'll take a soil sample first — I always take soil samples first, it's a reflex — and then I'll stand up and look around and try to understand what I'm seeing. And then I'll get to work. I've been waiting to get to work for thirty years. I can't wait for tomorrow.",
  },
];

// ---------------------------------------------------------------------------
// Assembled storylines
// ---------------------------------------------------------------------------

export const STORYLINES: Storyline[] = [
  {
    id: "mara-chen",
    characterId: "mara-chen",
    title: "The Last Signal",
    chapters: MARA_CHAPTERS,
  },
  {
    id: "kai-voss",
    characterId: "kai-voss",
    title: "Inheritance",
    chapters: KAI_CHAPTERS,
  },
  {
    id: "atlas-torres",
    characterId: "atlas-torres",
    title: "Clean Break",
    chapters: ATLAS_CHAPTERS,
  },
  {
    id: "yara-osei",
    characterId: "yara-osei",
    title: "Seventeen Thousand",
    chapters: YARA_CHAPTERS,
  },
];
