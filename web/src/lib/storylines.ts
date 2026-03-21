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
};

// ---------------------------------------------------------------------------
// Storyline A — Zix (alien tourist)
// ---------------------------------------------------------------------------

const ZIX_CHAPTERS: Chapter[] = [
  {
    index: 0,
    title: "The Brochure Was Misleading",
    briefing:
      "Hello. I am Zix. I booked a holiday package to a planet called 'Verdant Paradise' and the ship dropped me off in completely the wrong star system. The travel agent is not responding to my messages. I have snacks for approximately nine days and a strong desire to find somewhere with a breathable atmosphere and, ideally, a beach. I am told your species is quite good at reading light curves. I would very much appreciate your help finding a suitable planet.",
    briefingExpression: "serious",
    beat1:
      "Oh! That transit dip is very promising. You found something. I have updated my itinerary. Now I need to check whether there is water nearby — my species requires it for both drinking and recreational splashing.",
    beat1Expression: "happy",
    beat2:
      "Water confirmed. Excellent. I have already mentally named the beach. Now I need to see what the surface actually looks like before I commit to landing. Last time I trusted a brochure I ended up on a sulphur moon.",
    beat2Expression: "surprised",
    resolution:
      "That surface looks perfectly acceptable. Possibly even nice. I am going to land, set up my portable shelter, and send a very strongly worded review to the travel agency. Thank you for your assistance. You are much more helpful than the travel agent.",
    resolutionExpression: "happy",
    ambience: "ship",
  },
  {
    index: 1,
    title: "The Shelter Situation",
    briefing:
      "I have landed. The beach is real and it is excellent. However, I have discovered that my portable shelter has a hole in it, which means I need to find a more permanent location. I have identified three candidate planets from the local star charts but I need someone to check the transit data — my navigation system is still set to the wrong star system and I do not trust it.",
    beat1:
      "Good signal. That is a real planet. I am beginning to think your star system has quite a lot of planets in it, which is convenient for me. Water check next — the hole in my shelter is letting in wind and I would prefer somewhere calmer.",
    beat2:
      "Plenty of water. I have started a list of requirements for the new location: water, stable atmosphere, no sulphur, ideally some shade. The surface scan will tell me about the shade situation.",
    resolution:
      "That looks like it has shade. I am very pleased. I have packed up the leaky shelter and I am ready to move. You are becoming quite essential to my holiday. I hope you are enjoying this as much as I am.",
  },
  {
    index: 2,
    title: "The Food Problem",
    briefing:
      "Good news: the new location has excellent shade. Bad news: I have eaten all my snacks. I need to find a planet with something edible growing on it, which means I need stable light levels, liquid water, and a surface that is not entirely rock. I have been studying your species' approach to this problem and I believe the answer involves looking at light curves again. I am ready.",
    beat1:
      "That orbital period is very stable. Consistent light, reasonable distance from the star — things could grow there. I am cautiously optimistic. Now let us check the water situation, because things that grow need water and so do I.",
    beat2:
      "Good water. I have been thinking about what I would most like to eat right now and the answer is something crunchy. I do not know if this planet has anything crunchy on it. The surface scan may give me clues.",
    resolution:
      "Mineral-rich surface. Things will definitely grow there. I am going to land and begin an exploratory food survey. If I find something crunchy I will send you a sample. Thank you again. You are very good at this.",
  },
  {
    index: 3,
    title: "The Navigation Update",
    briefing:
      "My navigation system has finally updated. It turns out I am in entirely the right star system — the travel agent just labelled the map wrong. This means Verdant Paradise is actually reachable from here. I need to plot the correct route, which requires checking the transit data for the approach corridor. I am very excited. I have been on this unplanned holiday for three weeks and I am ready for the planned one.",
    beat1:
      "Clear approach. I can see the route now. I have been thinking about what I will do when I arrive at Verdant Paradise and the answer is: lie down for a very long time. But first, asteroid check — I need to confirm the fuel situation.",
    beat2:
      "Fuel confirmed. I have repacked my bag. I have thrown away the leaky shelter. I have eaten the last of the emergency rations I found in a compartment I forgot about. Surface scan — one more look at where I have been.",
    resolution:
      "A good surface. I will miss it, actually. It was not what I planned but it was quite good. Right. Verdant Paradise, here I come. Thank you for everything. I will leave you a review. Five stars.",
  },
  {
    index: 4,
    title: "Verdant Paradise",
    briefing:
      "I am almost there. The approach corridor is clear and the navigation system is, for once, showing me something that matches what I can see out the window. I want to do one final data check before I land — I have learned, on this trip, that checking the data is always worth doing. It has saved me from a sulphur moon, a waterless rock, and at least two very bad decisions. One last look.",
    beat1:
      "Still there. Still real. I keep checking because I still do not entirely trust the navigation system, but the data agrees with it, which is reassuring. Asteroid check — last one.",
    beat2:
      "Everything confirmed. I am going to land. I am going to find the beach. I am going to lie down. Surface — one final look at where I am going.",
    resolution:
      "That is a beach. That is an actual beach. I can see it in the surface data. I am going in. Thank you. Genuinely, sincerely, from the bottom of my three hearts — thank you.",
    resolutionExpression: "happy",
    ambience: "ship",
  },
];

// ---------------------------------------------------------------------------
// Storyline B — Commander Brix (alien supply run)
// ---------------------------------------------------------------------------

const BRIX_CHAPTERS: Chapter[] = [
  {
    index: 0,
    title: "The Supply List",
    briefing:
      "I am Commander Brix of the Outer Rim Supply Corps. My job is to find planets with water, minerals, and stable atmospheres and log them for future supply depots. It is not glamorous work but someone has to do it and that someone is me. I have a list of twelve candidate systems and not enough fuel to check all of them, so I need to be efficient. Your light curve analysis will help me narrow the list. Shall we begin?",
    briefingExpression: "serious",
    beat1:
      "Confirmed transit signal. That goes on the list. The Supply Corps will be pleased — they have been asking for new candidates in this sector for months. Now I need to check the asteroid field for water ice. Water is always the first question.",
    beat1Expression: "neutral",
    beat2:
      "Water confirmed. Good. I have logged it. The surface scan will tell me about mineral content — the Corps needs both water and building materials for a proper depot.",
    beat2Expression: "serious",
    resolution:
      "Solid mineral readings. This is a viable depot site. I am filing the report now. Thank you for your assistance — the Corps does not usually have access to this quality of transit data. I will note your contribution in the log.",
    resolutionExpression: "neutral",
    ambience: "ship",
  },
  {
    index: 1,
    title: "Candidate Seven",
    briefing:
      "Candidate seven on the list. The previous six were either too hot, too cold, or had atmospheres that would dissolve the depot walls, which is not ideal. I am cautiously optimistic about this one based on the star type. The transit data will tell us if there is actually a planet there or if the charts are wrong again. The charts are wrong surprisingly often.",
    beat1:
      "The charts were not wrong this time. Good planet signal. I have updated the log. The asteroid field on this heading has been flagged by a previous survey as potentially water-rich — let us verify.",
    beat2:
      "Verified. I have now found water on four of the seven candidates, which is above average for this sector. The surface scan is the final check — I need to know if the terrain is buildable.",
    resolution:
      "Buildable terrain. Candidate seven is approved. I am beginning to think this sector is better than its reputation. I will recommend a full survey team. Good work today.",
  },
  {
    index: 2,
    title: "The Detour",
    briefing:
      "I have been asked to check a system that is not on my original list. Apparently someone in the Corps flagged it based on old data and wants a current reading. I do not know why this system was flagged or what they expect to find — the request just says 'verify and report.' I am verifying and reporting. Transit data first.",
    beat1:
      "There is definitely something there. The old data was right. I am now curious about why this system was flagged specifically — the signal has an unusual profile. But curiosity is not in the job description. Asteroid check.",
    beat2:
      "Water present. The system is viable. I have sent the preliminary report and received back a message that just says 'confirmed, thank you.' Very informative. Surface scan, and then I am back to the original list.",
    resolution:
      "Good surface. Whatever they wanted to know about this system, the answer is: it is fine, it has water, the terrain is reasonable. I have filed the report. On to candidate eight.",
  },
  {
    index: 3,
    title: "Candidate Ten",
    briefing:
      "Candidate ten. I am making good progress through the list. The fuel situation is better than expected — the asteroid fields in this sector have been generous with water ice, which I have been converting as I go. I need to check this candidate carefully because the star type is unusual and the Corps has specific requirements for depot stability. Transit data will tell us if the orbital mechanics are sound.",
    beat1:
      "Sound orbital mechanics. The star type is unusual but the planet's position compensates for it — stable light levels, reasonable temperature range. I am impressed. Asteroid check for the fuel situation.",
    beat2:
      "Fuel situation: excellent. I have enough to complete the list and return with margin to spare. Surface scan — I want to see the terrain before I make the final recommendation.",
    resolution:
      "Excellent terrain. Candidate ten is the best site I have found on this run. I am flagging it as priority one for the next depot build. This has been a productive survey. Thank you for the data support.",
  },
  {
    index: 4,
    title: "Final Report",
    briefing:
      "Last candidate on the list. I have found viable sites at candidates four, seven, and ten. The Corps will be pleased. This final check is due diligence — I want to be thorough before I file the complete report. Transit data, asteroid check, surface scan. Same as always. Let us finish properly.",
    beat1:
      "Good signal. I appreciate consistency. The asteroid field here is the last one I need to check — if it has water, I will have a complete data set for the full list.",
    beat2:
      "Complete data set achieved. I have everything I need. Surface scan — final entry in the log.",
    resolution:
      "Good surface. The report is complete. Twelve candidates surveyed, four viable depot sites identified, fuel reserves adequate for return. A successful run. I will see you on the next one.",
    resolutionExpression: "neutral",
    ambience: "ship",
  },
];

// ---------------------------------------------------------------------------
// Storyline C — Pip (young alien, first solo mission)
// ---------------------------------------------------------------------------

const PIP_CHAPTERS: Chapter[] = [
  {
    index: 0,
    title: "First Solo",
    briefing:
      "Hi! I'm Pip. This is my first solo navigation mission — my instructor said I was ready and I think she was right, mostly. I need to find a planet with liquid water for my certification exam. The exam board requires photographic evidence of a transit signal, a water source, and a surface scan. I have the equipment, I have the checklist, and I have a lot of enthusiasm. Let's find a planet!",
    briefingExpression: "happy",
    beat1:
      "I found one! I actually found one! Okay, staying calm, staying professional. The transit dip is clear and the signal is strong. I am logging this very carefully because the exam board is very particular about documentation. Water check next — this is the part I was most nervous about.",
    beat1Expression: "surprised",
    beat2:
      "Water! There is water! I have been practising the asteroid annotation technique for weeks and it worked exactly like the training said it would. I am so relieved. Surface scan is the last step. I can do this.",
    beat2Expression: "happy",
    resolution:
      "Surface scan complete. I have all three pieces of evidence. I am going to submit this to the exam board right now before anything goes wrong. Thank you so much for helping me — I was a bit nervous at the start but this went really well. I think I passed!",
    resolutionExpression: "happy",
    ambience: "lab",
  },
  {
    index: 1,
    title: "The Second One",
    briefing:
      "I passed! The exam board gave me a distinction, which my instructor said was unusual for a first attempt. She has now given me a second assignment: find a planet suitable for a research outpost. This means I need stable light, water, and a surface that is not too rocky for building. It is more specific than the first assignment but I feel much more confident now. Let's go.",
    beat1:
      "Good transit signal. The orbital period looks stable — consistent light levels, which is what the outpost needs. I am getting better at reading these curves. Water next.",
    beat2:
      "Water confirmed. I have been taking notes on the asteroid annotation process because I want to get faster at it. The surface scan will tell me about the terrain — I need to know if it is buildable.",
    resolution:
      "Buildable terrain. I am filing the report. My instructor is going to be pleased. I am already thinking about the third assignment. I wonder what it will be.",
  },
  {
    index: 2,
    title: "The Tricky One",
    briefing:
      "My instructor has given me what she calls 'a tricky one.' The star in this system is variable, which means the light curve is noisier than usual and the transit signal will be harder to pick out. She says this is good practice. I have been studying variable star patterns all week. I am ready. Probably.",
    beat1:
      "I found it. It took longer than usual but I found it. The signal was there underneath the noise — you just have to know what to look for. My instructor was right, this is good practice. Water check — I am hoping the asteroid field is straightforward.",
    beat2:
      "The asteroid field was straightforward. I needed that after the tricky light curve. Surface scan — let's see what we are dealing with.",
    resolution:
      "Interesting surface. Lots of variation in the terrain — my instructor will probably ask me to write a report on what caused it. I am already thinking about the answer. This is the part of the job I like most.",
  },
  {
    index: 3,
    title: "Teaching Someone Else",
    briefing:
      "My instructor has asked me to help train a new student. I am going to demonstrate the full survey process — transit data, asteroid check, surface scan — while explaining what I am doing and why. The new student is watching. I want to do this well. Here we go.",
    beat1:
      "Transit signal confirmed. I explained the dip shape and what it tells us about the planet's size and orbital period. The new student asked a good question about noise filtering. I think they are going to be fine. Water next.",
    beat2:
      "Water confirmed. I showed the new student how to read the asteroid annotation results and what the different ice signatures mean. They took notes. I remember taking notes like that. Surface scan — last demonstration.",
    resolution:
      "Surface scan complete. The new student said the process made more sense watching it live than reading about it. I told them that is how I felt too. My instructor is smiling. I think that means I did well.",
  },
  {
    index: 4,
    title: "The Real Thing",
    briefing:
      "My instructor has given me my first real assignment — not a training exercise, not an exam. An actual survey request from an actual client who needs an actual planet. I have done this many times in training. This is the same process. I am telling myself that because I am a little nervous. Let's do the survey.",
    beat1:
      "Real transit signal for a real client. I am logging everything very carefully. The client needs this data for a settlement feasibility study, which means the stakes are higher than a training exercise. Water check.",
    beat2:
      "Water confirmed. I have been thinking about the people who might eventually live on this planet, if the feasibility study goes well. That is a strange thing to think about while doing an asteroid survey. Surface scan.",
    resolution:
      "Good surface. The report is complete. I am sending it to the client now. My instructor says this is what the job actually is — careful work that other people rely on. I think I understand that now. I am glad I started with the training.",
    resolutionExpression: "happy",
    ambience: "lab",
  },
];

// ---------------------------------------------------------------------------
// Storyline D — The Cartographer (alien mapping expedition)
// ---------------------------------------------------------------------------

const CARTA_CHAPTERS: Chapter[] = [
  {
    index: 0,
    title: "Blank Space",
    briefing:
      "I map things. That is my entire job and I find it deeply satisfying. This sector of your galaxy is listed on our charts as 'unmapped' with a small note that says 'probably fine.' I am here to replace 'probably fine' with actual data. I have a blank chart, a full fuel tank, and a methodical approach to everything. We will start with transit data — I want to know what planets are actually here.",
    briefingExpression: "serious",
    beat1:
      "First entry on the chart. I have given it a preliminary designation and noted the transit parameters. The asteroid field will give me the water data — water sources are important for the chart because travellers need to know where to refuel.",
    beat1Expression: "neutral",
    beat2:
      "Water source logged. I have marked it on the chart with the standard refuelling symbol. Surface data is the final entry for this location — terrain type, mineral content, habitability rating.",
    beat2Expression: "serious",
    resolution:
      "First location complete. The chart is no longer blank in this corner. I find this very satisfying. On to the next one.",
    resolutionExpression: "neutral",
    ambience: "lab",
  },
  {
    index: 1,
    title: "The Cluster",
    briefing:
      "There is a cluster of signals in this part of the sector that the old charts marked as 'interference, ignore.' I do not ignore things. I investigate them. The transit data will tell me whether these are real planets or whether the old charts were right about the interference. I am prepared for either outcome.",
    beat1:
      "Real planets. The old charts were wrong. I am adding a note to the chart that says 'previous survey incorrect — see current data.' I do this more often than you might expect. Water check for this location.",
    beat2:
      "Water present. The cluster is genuinely interesting — multiple viable locations in close proximity. This is going to be a useful section of the chart. Surface scan.",
    resolution:
      "Good surface data. I have updated the chart for this location and flagged the cluster for a follow-up survey. Someone will want to know about this. The chart is getting less blank.",
  },
  {
    index: 2,
    title: "The Edge",
    briefing:
      "I am at the edge of the mapped region. Beyond this point the chart is completely empty. I find this exciting rather than alarming, which my colleagues say is unusual. The transit data here will be the first data anyone has collected in this part of the sector. I am going to be very careful and very thorough.",
    beat1:
      "First signal beyond the edge. I have marked it on the chart with a small star to indicate it is a new discovery. The asteroid field here is uncharted too — I will be the first to log its water content.",
    beat2:
      "First water source beyond the edge. I have given it a proper designation and noted the ice composition. Surface scan — first surface data from this region.",
    resolution:
      "First surface data logged. The chart now extends further than it did this morning. I am going to sit here for a moment and appreciate that. Then I am going to keep going.",
  },
  {
    index: 3,
    title: "Corrections",
    briefing:
      "I have found three errors in the existing charts today. This is not unusual — old charts are often based on incomplete data or outdated instruments. My job is not just to add new information but to correct what is wrong. The transit data for this location will either confirm the existing chart entry or replace it. I am ready for either.",
    beat1:
      "The existing entry was wrong. The planet is there but the orbital parameters are significantly different from what was recorded. I have corrected the chart and noted the discrepancy. Water check — let us see if the old data got this right.",
    beat2:
      "The water data was also wrong. The old survey missed a significant ice deposit in the asteroid field. I have updated the chart. Surface scan — I want to see if the terrain matches the old description.",
    resolution:
      "Terrain does not match the old description either. Three corrections for one location. I have flagged this for a full re-survey recommendation. The chart is more accurate than it was. That is the job.",
  },
  {
    index: 4,
    title: "The Last Blank",
    briefing:
      "I have reached the last unmapped section of this survey area. After this, the chart will be complete — at least for this expedition. I have been working on this sector for a long time and I am looking forward to filing the final report. One last full survey. Let us do it properly.",
    beat1:
      "Last transit signal of the expedition. I have logged it carefully. The asteroid field here is the last one I need to check — after this, the water data for the entire sector will be complete.",
    beat2:
      "Last water source logged. The chart is almost complete. Surface scan — final entry.",
    resolution:
      "Final entry complete. The chart is done. 'Probably fine' has been replaced with actual data — planet locations, water sources, surface terrain, habitability ratings. I am going to file this report and then take a very long rest. Thank you for your help with the data. The chart is better for it.",
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
    title: "Wrong Star System",
    chapters: ZIX_CHAPTERS,
  },
  {
    id: "brix",
    characterId: "brix",
    title: "Supply Run",
    chapters: BRIX_CHAPTERS,
  },
  {
    id: "pip",
    characterId: "pip",
    title: "First Solo",
    chapters: PIP_CHAPTERS,
  },
  {
    id: "carta",
    characterId: "carta",
    title: "Blank Space",
    chapters: CARTA_CHAPTERS,
  },
];
