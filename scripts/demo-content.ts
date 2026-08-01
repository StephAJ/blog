/**
 * Demo content used by `npm run db:seed`. Everything here is safe to delete
 * once real posts exist — see README ("Replacing the demo content").
 */

export type DemoSection = { heading?: string; body: string[]; quote?: string; list?: string[] };

export type DemoPost = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  cover: string;
  featured?: boolean;
  pinned?: boolean;
  daysAgo: number;
  views: number;
  sections: DemoSection[];
};

export const demoCategories = [
  { name: "Technology", slug: "technology", color: "#2563eb", description: "Hardware, software and the systems that quietly run everything." },
  { name: "Design", slug: "design", color: "#d9482b", description: "Interfaces, typography and the craft of making things feel obvious." },
  { name: "Business", slug: "business", color: "#0f766e", description: "How companies are built, funded and occasionally undone." },
  { name: "Productivity", slug: "productivity", color: "#7c3aed", description: "Systems for doing focused work without burning out." },
  { name: "Lifestyle", slug: "lifestyle", color: "#db2777", description: "Habits, hobbies and the texture of ordinary days." },
  { name: "Health", slug: "health", color: "#16a34a", description: "Sleep, movement, food and the science behind them." },
  { name: "Travel", slug: "travel", color: "#ea580c", description: "Places worth the flight and the ones worth skipping." },
  { name: "Photography", slug: "photography", color: "#0891b2", description: "Light, composition and gear that earns its weight." },
  { name: "Culture", slug: "culture", color: "#9333ea", description: "Books, music, film and the arguments they start." },
];

export const demoTags = [
  "AI", "Machine Learning", "Web Development", "Typography", "Remote Work",
  "Startups", "Open Source", "Focus", "Nutrition", "Sleep", "Cities",
  "Gear", "Interviews", "Essays", "Tools", "Career",
];

export const demoPosts: DemoPost[] = [
  {
    title: "The quiet return of the personal website",
    slug: "the-quiet-return-of-the-personal-website",
    excerpt:
      "For fifteen years we rented space on other people's platforms. A growing number of writers are moving back to a domain they actually own — and the tooling has finally caught up.",
    category: "Technology",
    tags: ["Web Development", "Essays", "Open Source"],
    cover: "https://picsum.photos/seed/personal-website/1600/900",
    featured: true,
    pinned: true,
    daysAgo: 2,
    views: 4820,
    sections: [
      {
        body: [
          "There is a particular feeling that comes from publishing something on a domain you control. It is not nostalgia, exactly. It is closer to the difference between hanging a picture in your own hallway and pinning it to a corkboard in a building someone else can sell tomorrow.",
          "For most of the last two decades that difference did not seem to matter much. Platforms were free, fast and full of readers. You wrote where the audience already was, and the trade — your work in exchange for their distribution — looked obviously favourable.",
        ],
      },
      {
        heading: "What actually changed",
        body: [
          "Three things shifted at roughly the same time. Distribution stopped being reliable: the same post that reached fifty thousand people in 2016 reaches four thousand now, and nobody can tell you precisely why. Platforms started competing with the writers on them, quietly ranking native video above outbound links. And the cost of running your own site collapsed.",
          "That last point is the one people underestimate. A static site with a database, an admin panel, image optimisation and a search index used to be a small engineering project. It is now a weekend, and it runs on a five-dollar virtual machine with room to spare.",
        ],
        list: [
          "Deployment is a git push and a process manager, not a server team.",
          "TLS certificates are free and renew themselves.",
          "A single SQLite file will comfortably serve a blog with millions of monthly reads.",
        ],
      },
      {
        heading: "The ownership argument, minus the sermon",
        body: [
          "It is easy to make this sound moralistic, and that is usually where the argument loses people. So here is the practical version: when you own the domain and the archive, every reader you earn stays earnable. You can change the design, the platform, the business model and even the subject matter without asking permission or losing the back catalogue.",
          "The corollary is that you also inherit the boring parts. Nobody else is going to fix your broken image links, keep your dependencies patched or notice that the RSS feed has been serving a stale cache since March.",
        ],
        quote:
          "A personal site is not a growth strategy. It is a place to keep the things you would be sad to lose.",
      },
      {
        heading: "Where the audience comes from now",
        body: [
          "The honest answer is: more slowly, and from more places. Search still works if you write things people are actually looking for. Newsletters have quietly become the most durable distribution channel of the decade, precisely because an email list is the one asset that travels with you.",
          "The rest arrives through other people's links — a mention in a newsletter you do not read, a comment thread you were not part of, a colleague who forwards the thing to a group chat. It compounds much more slowly than an algorithmic spike, and it decays much more slowly too.",
        ],
      },
      {
        heading: "A reasonable setup",
        body: [
          "If you are starting over today, the shape that works looks something like this. A domain you renew for ten years at a time. A site that renders fast on a phone with two bars of signal. A feed. An email list. Analytics you actually read once a month rather than refresh hourly.",
          "Everything else — comments, memberships, a podcast, a shop — is optional, and worth adding only when the writing itself has found its footing. Start with the archive. The infrastructure can grow into it.",
        ],
      },
    ],
  },
  {
    title: "Typography for people who are not typographers",
    slug: "typography-for-people-who-are-not-typographers",
    excerpt:
      "You do not need to know what a ligature is to make text look good. Six decisions carry almost all of the weight, and most of them are about restraint.",
    category: "Design",
    tags: ["Typography", "Tools"],
    cover: "https://picsum.photos/seed/typography/1600/900",
    featured: true,
    daysAgo: 5,
    views: 3610,
    sections: [
      {
        body: [
          "Most bad typography is not the result of choosing the wrong typeface. It is the result of making six ordinary decisions slightly wrong, in the same direction, until the page feels vaguely cheap without anyone being able to say why.",
          "Here are the six, in the order they matter.",
        ],
      },
      {
        heading: "1. Measure before typeface",
        body: [
          "The single highest-leverage change you can make to a body of text is the line length. Somewhere between 60 and 80 characters per line is the range where reading stops requiring effort. Wider than that and the eye loses its place returning to the left margin. Narrower and the rhythm breaks every few words.",
          "Set the measure first. Then pick a typeface that looks good at that width, rather than picking a typeface and squeezing the layout around it.",
        ],
      },
      {
        heading: "2. Line height scales with line length",
        body: [
          "A common mistake is treating line height as a fixed number. It is not — it is a ratio that should grow as the measure grows. Short lines can breathe at 1.4. A wide column of serif body text will want 1.7 or more, because the return journey to the next line is longer and needs a clearer runway.",
        ],
      },
      {
        heading: "3. Two typefaces is a ceiling, not a target",
        body: [
          "One family with a real range of weights will out-perform three families chosen for variety. If you do use two, make them obviously different — a geometric sans against a bookish serif — so the contrast reads as deliberate rather than accidental.",
        ],
        quote: "If a reader notices the typeface before the sentence, something has gone wrong.",
      },
      {
        heading: "4. Size relationships, not sizes",
        body: [
          "Pick a base size that is comfortable on a phone — 17 to 19 pixels for body copy is a reasonable modern default — and derive everything else from a consistent scale. A 1.25 or 1.333 ratio gives you headings that feel related rather than arbitrary.",
          "The failure mode here is a heading that is only slightly larger than the paragraph beneath it. Either commit to the hierarchy or remove it.",
        ],
      },
      {
        heading: "5. Space is structure",
        body: [
          "Whitespace is how a reader knows what belongs to what. A heading should sit noticeably closer to the paragraph it introduces than to the paragraph it follows. Get that one relationship right and half of your layout problems disappear.",
        ],
      },
      {
        heading: "6. Contrast, then check it",
        body: [
          "Light grey text on a white background reads as elegant on a calibrated monitor in a dim room, and as illegible on a phone in daylight. Aim for a contrast ratio of at least 4.5:1 on body text. It costs nothing and it is the accessibility fix with the widest reach.",
        ],
      },
    ],
  },
  {
    title: "What eight months of fully remote work actually taught us",
    slug: "eight-months-of-fully-remote-work",
    excerpt:
      "The productivity debate misses the point. The real variable is not where people sit — it is how much of the work has been written down.",
    category: "Business",
    tags: ["Remote Work", "Career", "Startups"],
    cover: "https://picsum.photos/seed/remote-work/1600/900",
    featured: true,
    daysAgo: 9,
    views: 2940,
    sections: [
      {
        body: [
          "The argument about remote work has been stuck in the same loop for years. One side produces a study showing engineers ship more from home. The other produces a study showing junior staff learn less. Both are correct, and neither is the interesting part.",
          "What we found, after eight months of running a distributed team with no office to fall back on, is that location barely predicts anything. Documentation does.",
        ],
      },
      {
        heading: "Meetings are a symptom",
        body: [
          "When a team goes remote, meeting load usually spikes. The instinct is to treat this as a scheduling problem and to solve it with policy — no-meeting Wednesdays, a thirty-minute default, an agenda requirement.",
          "Those help at the margins. But most recurring meetings exist to transmit information that nobody wrote down. If the decision, the reasoning and the current state all live in someone's head, the only retrieval mechanism is a conversation. The meeting is the interface to an undocumented system.",
        ],
        quote:
          "Every recurring status meeting is a document that someone decided not to write.",
      },
      {
        heading: "The three-hour rule",
        body: [
          "The most useful convention we adopted was deliberately unglamorous: any decision that affects more than one person gets written down within three hours, in the place where that kind of decision lives, with the reasoning included.",
          "Not a summary. The reasoning. Six months later the summary tells you what was decided; only the reasoning tells you whether the decision still applies.",
        ],
        list: [
          "Decisions go in the project doc, not the chat thread.",
          "Chat threads get a link to the doc, not a paraphrase.",
          "If nobody can find it in two minutes, it was not written down.",
        ],
      },
      {
        heading: "Where remote genuinely struggles",
        body: [
          "Two things did get harder and we never fully solved them. The first is apprenticeship. A junior engineer learns an enormous amount from ambient exposure — overheard debugging, watching someone senior make a judgement call in real time. Screen sharing recovers maybe half of that.",
          "The second is the low-stakes conversation that turns into a good idea. You cannot schedule serendipity, and the attempts to do so — randomised coffee pairings, virtual hangouts — mostly produce polite small talk.",
        ],
      },
      {
        heading: "What we would do differently",
        body: [
          "We would invest in written onboarding far earlier, and we would be much more deliberate about pairing juniors with seniors on real work rather than on training exercises. We would also stop pretending that four hours of overlapping time zones is the same thing as being asynchronous.",
          "The teams that thrive remotely are not the ones with the best video conferencing. They are the ones where a new hire can reconstruct the last two years of reasoning from the archive.",
        ],
      },
    ],
  },
  {
    title: "A practical guide to deep work in a noisy job",
    slug: "practical-guide-to-deep-work",
    excerpt:
      "Most focus advice assumes you control your calendar. Here is what actually works when you do not.",
    category: "Productivity",
    tags: ["Focus", "Career", "Tools"],
    cover: "https://picsum.photos/seed/deep-work/1600/900",
    daysAgo: 13,
    views: 5210,
    sections: [
      {
        body: [
          "The standard advice for concentrated work is to block four uninterrupted hours in the morning and defend them ruthlessly. This is excellent advice for people who already have the authority to do it, and completely useless for everyone else.",
          "If your calendar is filled by other people, the useful question is not how to find a four-hour block. It is how to get real work out of the ninety-minute gaps you actually have.",
        ],
      },
      {
        heading: "Shrink the startup cost",
        body: [
          "The reason a ninety-minute gap feels unusable is that the first twenty minutes go to reloading context — where was I, what was I doing, why did I choose this approach. Cut that reload time and the gap becomes genuinely productive.",
          "The cheapest way to do this is to stop at a deliberate point rather than an exhausted one. Leave a one-line note describing the next concrete action, not the general goal. \"Write the retry handler for the webhook consumer\" restarts instantly. \"Continue with webhooks\" does not.",
        ],
        quote:
          "Finish each session by writing down the next move. Future you is a stranger with no memory.",
      },
      {
        heading: "Batch the shallow work honestly",
        body: [
          "Everyone agrees you should batch email. Almost nobody accounts for how much shallow work is not email — the review that takes eleven minutes, the question in a thread, the form that needs signing.",
          "Track it for one week. Most people find they are spending two to three hours a day on tasks they never counted, and the discovery alone changes their scheduling.",
        ],
        list: [
          "Two fixed windows a day for anything that takes under fifteen minutes.",
          "Everything else goes on a list, not into the current hour.",
          "Anything that has waited a week and hurt nobody gets deleted.",
        ],
      },
      {
        heading: "Protect the edges, not the middle",
        body: [
          "If you cannot control your calendar, you can usually control the thirty minutes before your first meeting and the hour after your last. These edges are less contested and they are more than enough for one meaningful unit of work per day.",
          "One unit a day is not impressive on any given Tuesday. Over a quarter it is roughly sixty units, which is more than most people produce in bursts of heroic focus followed by two weeks of recovery.",
        ],
      },
    ],
  },
  {
    title: "The camera you already own is better than you think",
    slug: "the-camera-you-already-own",
    excerpt:
      "Sensor size stopped being the bottleneck a while ago. Light, distance and patience are doing most of the work in every photograph you admire.",
    category: "Photography",
    tags: ["Gear", "Tools"],
    cover: "https://picsum.photos/seed/camera/1600/900",
    daysAgo: 17,
    views: 1880,
    sections: [
      {
        body: [
          "Every few months someone posts a side-by-side comparison of a flagship phone and a full-frame camera, and the comments fill with people explaining why the comparison is unfair. They are usually right, and it usually does not matter.",
          "The gap between a good photograph and a mediocre one is almost never resolved by the sensor. It is resolved before the shutter, by three decisions that cost nothing.",
        ],
      },
      {
        heading: "Light first",
        body: [
          "Photography is the practice of noticing light before you notice the subject. The same street corner is unremarkable at noon and extraordinary forty minutes before sunset, and no amount of sensor area will close that gap.",
          "Practical version: if the light is flat, either wait, move, or shoot something else. Those are the only three options and the first one is usually correct.",
        ],
      },
      {
        heading: "Get closer, then closer again",
        body: [
          "Robert Capa's line about not being close enough has survived eighty years because it keeps being true. Most amateur photographs contain three subjects competing for attention, and the fix is almost always subtraction by proximity.",
          "Zoom is not the same thing. Walking changes the relationship between foreground and background; zooming only crops.",
        ],
        quote: "If the photograph is not good enough, you are not close enough — and rarely far enough away from the tripod.",
      },
      {
        heading: "Where the gear genuinely matters",
        body: [
          "There are real limits. Low light with moving subjects will defeat a phone. Long telephoto reach is a physics problem, not a software one. Shallow depth of field can be simulated but not yet convincingly at the edges of hair and glass.",
          "If your work lives in those places, buy the camera. If it does not — and for most people it does not — the money is better spent on going somewhere interesting at the right time of day.",
        ],
      },
    ],
  },
  {
    title: "How much sleep debt can you actually repay?",
    slug: "how-much-sleep-debt-can-you-repay",
    excerpt:
      "The weekend catch-up is real but partial. Here is what the research says about which functions recover, which do not, and how long it takes.",
    category: "Health",
    tags: ["Sleep", "Nutrition"],
    cover: "https://picsum.photos/seed/sleep/1600/900",
    daysAgo: 21,
    views: 6430,
    sections: [
      {
        body: [
          "Sleep debt is a useful metaphor and a slightly misleading one. Debt implies a ledger where every hour lost can be repaid at par. The evidence suggests the repayment is real but heavily discounted, and that different systems recover at very different rates.",
        ],
      },
      {
        heading: "What recovers quickly",
        body: [
          "Subjective sleepiness rebounds fast. After one or two nights of extended sleep, most people report feeling essentially normal — which is precisely the problem, because feeling recovered and being recovered diverge sharply here.",
          "Simple reaction time also improves quickly, though it tends to plateau below the baseline established before the deprivation.",
        ],
      },
      {
        heading: "What lags",
        body: [
          "Working memory, sustained attention and — most consistently across studies — emotional regulation take considerably longer. Several protocols show measurable deficits persisting after a week of unrestricted recovery sleep following a period of moderate restriction.",
          "Glucose metabolism is the other laggard. Short sleep produces insulin resistance within days, and it does not resolve on the same timescale as the tiredness does.",
        ],
        list: [
          "One night of recovery restores mood far more than it restores accuracy.",
          "Consistency of timing appears to matter about as much as total duration.",
          "Weekend catch-up correlates with better outcomes than no catch-up, and worse outcomes than not accruing the debt.",
        ],
      },
      {
        heading: "The practical read",
        body: [
          "Treat the weekend recovery as harm reduction rather than a reset. If your week involves systematically short nights, the highest-return change is usually not a longer Sunday — it is moving your weekday bedtime earlier by thirty minutes and holding it.",
          "Thirty minutes sounds trivially small. Across five nights it is two and a half hours, which is roughly the size of the deficit most people are carrying.",
        ],
        quote: "You cannot bank sleep in advance, and you can only partially repay it afterwards. The arithmetic favours consistency.",
      },
    ],
  },
  {
    title: "Cities that are quietly getting the basics right",
    slug: "cities-getting-the-basics-right",
    excerpt:
      "Not the ones with the flashiest skyline. The ones where you can cross the road, find a bench and get home at midnight without a car.",
    category: "Travel",
    tags: ["Cities", "Essays"],
    cover: "https://picsum.photos/seed/cities/1600/900",
    daysAgo: 26,
    views: 2110,
    sections: [
      {
        body: [
          "There is a particular kind of city that never makes the lists. It has no signature building, no famous restaurant scene and no marketing campaign. It is simply extremely pleasant to exist in, and visitors usually cannot articulate why until they get home and notice the absence.",
        ],
      },
      {
        heading: "The unglamorous infrastructure",
        body: [
          "The ingredients are almost boringly consistent. Wide pavements with shade. Crossings that assume people walk. Public seating that is not designed primarily to prevent sleeping. A transit network that runs late enough that the last train is not a factor in your evening plans.",
          "None of this photographs well, which is part of why it stays underrated.",
        ],
        list: [
          "A bench every two hundred metres changes who can use the street.",
          "Shade is infrastructure, not decoration.",
          "Frequency beats speed: a train every six minutes feels faster than one every twenty.",
        ],
      },
      {
        heading: "Why it is hard to copy",
        body: [
          "These qualities are the accumulated output of decades of unremarkable decisions, most of them made by people whose names nobody knows. They cannot be installed in a single administration, which makes them politically unrewarding to pursue and easy to erode.",
          "The cities that have them tend to be the ones that never stopped maintaining what they already had.",
        ],
      },
    ],
  },
  {
    title: "Small models, big deployments: where inference is heading",
    slug: "small-models-big-deployments",
    excerpt:
      "The interesting frontier is no longer the largest model on a benchmark. It is the smallest model that clears the bar for a specific job.",
    category: "Technology",
    tags: ["AI", "Machine Learning", "Tools"],
    cover: "https://picsum.photos/seed/inference/1600/900",
    featured: true,
    daysAgo: 31,
    views: 7250,
    sections: [
      {
        body: [
          "For several years the story was straightforward: bigger models were better models, and the interesting work happened at the frontier. That story is still partly true and has stopped being the whole picture.",
          "In production, the binding constraint is rarely peak capability. It is latency, cost per call, and the ability to run somewhere specific — a phone, a laptop, a machine inside a hospital network that will never be allowed to make an outbound request.",
        ],
      },
      {
        heading: "The bar is task-specific",
        body: [
          "A model that scores in the ninetieth percentile on a broad reasoning benchmark may be no better than one twenty times smaller at classifying support tickets into eleven categories. The benchmark measures general capability; the deployment needs one narrow competence delivered reliably at 40 milliseconds.",
          "Once teams start measuring against their actual task rather than a leaderboard, the model selection usually moves down a tier or two.",
        ],
        quote:
          "Choose the smallest model that clears the bar, then spend the savings on evaluation.",
      },
      {
        heading: "What gets you there",
        body: [
          "Three techniques do most of the work. Distillation, where a large model generates training data for a small one. Quantisation, which trades a small amount of accuracy for a large reduction in memory. And straightforward fine-tuning on a few thousand examples of the exact job.",
          "The combination routinely produces something that runs on commodity hardware and beats a much larger general model on the specific task, because it has seen the shape of the problem.",
        ],
        list: [
          "Distil from a frontier model, evaluate against held-out real traffic.",
          "Quantise to 4-bit and measure the delta — it is usually smaller than expected.",
          "Keep a frontier model in the loop for the hard tail, routed by confidence.",
        ],
      },
      {
        heading: "The architecture that is winning",
        body: [
          "The pattern that keeps appearing is a cascade. A small fast model handles the majority of requests. A confidence signal routes the ambiguous remainder to something larger. Costs drop by an order of magnitude and the quality ceiling stays where it was.",
          "It is not a novel idea — it is how spam filtering worked twenty years ago — but it is being rediscovered because the economics now demand it.",
        ],
      },
    ],
  },
  {
    title: "Reading more without turning it into a scoreboard",
    slug: "reading-more-without-a-scoreboard",
    excerpt:
      "Annual book counts are a strange metric for an activity whose entire value is what stays with you afterwards.",
    category: "Culture",
    tags: ["Essays", "Focus"],
    cover: "https://picsum.photos/seed/reading/1600/900",
    daysAgo: 37,
    views: 1490,
    sections: [
      {
        body: [
          "Somewhere in the last decade reading acquired a leaderboard. People set annual targets, log completions and post year-end totals, which is an odd development for a practice whose value is almost entirely in the residue rather than the throughput.",
        ],
      },
      {
        heading: "Abandonment is a skill",
        body: [
          "The single change that most reliably increases how much people read is permission to stop. Finishing a book you have lost interest in costs three weeks and teaches you very little, and the guilt of the unfinished pile suppresses starting the next one.",
          "A reasonable rule: fifty pages, then decide. For a difficult book you have chosen deliberately, extend it. For one you picked up on a recommendation, do not.",
        ],
        quote: "The best readers I know abandon more books than most people finish.",
      },
      {
        heading: "Notes, but lightly",
        body: [
          "Elaborate note-taking systems have a way of becoming the hobby, replacing the reading they were meant to support. The version that survives contact with real life is a single sentence per book, written a week after finishing, describing what you would tell a friend.",
          "If you cannot produce that sentence, the book did not land, and no amount of highlighting would have changed it.",
        ],
      },
    ],
  },
  {
    title: "Designing an admin interface people do not dread",
    slug: "designing-an-admin-interface",
    excerpt:
      "Internal tools get the least design attention and are used the most hours per user. That trade is exactly backwards.",
    category: "Design",
    tags: ["Tools", "Web Development", "Typography"],
    cover: "https://picsum.photos/seed/admin-ui/1600/900",
    daysAgo: 44,
    views: 2680,
    sections: [
      {
        body: [
          "Public-facing pages get the design budget because they are seen by more people. Admin panels get whatever is left, despite being used for thousands of hours by the small group whose productivity actually determines what ships.",
        ],
      },
      {
        heading: "Optimise for the fifth hour",
        body: [
          "Consumer interfaces are designed for the first minute — onboarding, discoverability, gentle guidance. Admin interfaces are used by people who learned the tool months ago and now want to move through it quickly.",
          "That flips several defaults. Density becomes a feature. Keyboard shortcuts stop being a power-user nicety. Confirmation dialogs on routine actions become friction rather than safety.",
        ],
        list: [
          "Show more rows, not more whitespace.",
          "Every destructive action needs undo, not a confirmation modal.",
          "Save state in the URL so a view can be bookmarked and shared.",
        ],
      },
      {
        heading: "The three screens that matter",
        body: [
          "Almost every admin tool reduces to a list, a detail view and a form. Get those three right and the rest is arrangement. Get them wrong and no amount of dashboard polish will compensate.",
          "The list needs fast filtering and a stable sort. The detail view needs the most-checked field visible without scrolling. The form needs to never lose work — autosave drafts, warn on navigation, and keep the submit button reachable.",
        ],
        quote: "Nobody has ever complained that an internal tool was too fast.",
      },
    ],
  },
  {
    title: "The economics of a five-dollar server in 2026",
    slug: "economics-of-a-five-dollar-server",
    excerpt:
      "Managed platforms are excellent and expensive. For a personal site, a small VPS is still absurdly good value — with a few caveats worth knowing up front.",
    category: "Technology",
    tags: ["Open Source", "Web Development", "Tools"],
    cover: "https://picsum.photos/seed/server/1600/900",
    daysAgo: 52,
    views: 3320,
    sections: [
      {
        body: [
          "A modern entry-level virtual server gives you two cores, a few gigabytes of memory and enough bandwidth to serve a well-optimised site to a genuinely large audience. At current prices that is roughly the cost of two coffees a month.",
          "The reason to think carefully anyway is that the sticker price is not the whole cost.",
        ],
      },
      {
        heading: "What you are actually buying",
        body: [
          "A managed platform sells you the absence of a category of problems: patching, certificate renewal, log rotation, the 3am reboot after a kernel update, and the specific misery of discovering your disk filled with journal files.",
          "Most of those are solvable in an afternoon with unattended upgrades, a reverse proxy that handles certificates automatically and a process manager that restarts on failure. But they are your afternoon.",
        ],
        list: [
          "Automatic security updates: on, from day one.",
          "Certificates: automated renewal, plus a calendar reminder as a backstop.",
          "Backups: a nightly copy of the database, stored somewhere that is not the server.",
        ],
      },
      {
        heading: "Where a small server stops being enough",
        body: [
          "Two workloads break it. Sustained image processing at request time, which will pin the CPU and take the site down with it — solve it by processing on upload rather than on read. And write-heavy database traffic, where a single file-backed database eventually becomes the bottleneck.",
          "For a blog, neither applies. Reads dominate by several orders of magnitude, and a well-indexed embedded database will serve them faster than a network round trip to a managed one.",
        ],
        quote:
          "The right question is not whether the server can handle the traffic. It is whether you will remember to renew the certificate.",
      },
    ],
  },
  {
    title: "Cooking for one without the waste",
    slug: "cooking-for-one-without-the-waste",
    excerpt:
      "Recipes assume four people. Shopping assumes a family. Here is a system built around the actual constraint: half a bunch of coriander going bad on Thursday.",
    category: "Lifestyle",
    tags: ["Nutrition", "Tools"],
    cover: "https://picsum.photos/seed/cooking/1600/900",
    daysAgo: 60,
    views: 1740,
    sections: [
      {
        body: [
          "The hardest part of cooking for one is not the cooking. It is that the ingredient economy is built for households, and the leftovers compound faster than you can eat them.",
        ],
      },
      {
        heading: "Build around a base, not a recipe",
        body: [
          "Cook one large batch of something neutral — grains, roasted vegetables, a pot of beans — and let it become three different meals through sauces and additions rather than three separate cooking sessions.",
          "The variation lives in the last two minutes: acid, fat, herbs, heat. That is where the impression of a different meal actually comes from.",
        ],
        list: [
          "One base, cooked Sunday, eaten Monday through Wednesday.",
          "Three finishing sauces in the fridge, made once a fortnight.",
          "Anything fresh gets used within four days or frozen on day two.",
        ],
      },
      {
        heading: "The freezer is the real appliance",
        body: [
          "Half a tin of tomato paste, the second half of the coriander, the bread that will be stale tomorrow — all of it freezes, and the discipline of freezing on the day you open something rather than the day you notice it wilting is what actually stops the waste.",
        ],
      },
    ],
  },
  {
    title: "Interviewing engineers without the whiteboard theatre",
    slug: "interviewing-engineers-without-whiteboard-theatre",
    excerpt:
      "The industry has spent a decade agreeing that algorithm puzzles are a poor signal, and roughly no time replacing them with something better.",
    category: "Business",
    tags: ["Interviews", "Career", "Startups"],
    cover: "https://picsum.photos/seed/interview/1600/900",
    daysAgo: 68,
    views: 4110,
    sections: [
      {
        body: [
          "Almost everyone who runs an engineering interview loop will tell you, privately, that the algorithm round is a weak predictor. Almost everyone runs it anyway, because it is legible, comparable across candidates and defensible when a hire does not work out.",
        ],
      },
      {
        heading: "What we replaced it with",
        body: [
          "A two-hour paid exercise on a real, small, self-contained problem from the actual codebase, with the candidate able to use whatever tools they normally use. Then a conversation about the choices they made.",
          "The conversation is the signal. Anyone can produce working code for a small problem. The differentiator is whether they can explain the trade-off they took, name the thing they would do differently with more time, and recognise which parts of their solution are load-bearing.",
        ],
        quote: "Hire for the conversation about the code, not the code.",
      },
      {
        heading: "The objections, answered",
        body: [
          "It does not scale — correct, and it does not need to. If you are hiring six engineers a year rather than six hundred, two hours of senior time per finalist is cheap relative to the cost of a bad hire.",
          "It disadvantages people with caregiving responsibilities — this is the serious objection. Pay for the time, keep it strictly bounded, and offer a synchronous alternative for anyone who prefers it.",
        ],
        list: [
          "Pay for the exercise, always.",
          "Cap it at two hours and mean it.",
          "Use a real problem you have already solved, so you can compare approaches.",
        ],
      },
    ],
  },
  {
    title: "Notes on running your first half marathon",
    slug: "notes-on-your-first-half-marathon",
    excerpt:
      "Twelve weeks, three runs a week, and a very strong argument for going slower than feels right.",
    category: "Health",
    tags: ["Focus", "Gear"],
    cover: "https://picsum.photos/seed/running/1600/900",
    daysAgo: 76,
    views: 2260,
    sections: [
      {
        body: [
          "The half marathon is the distance where the training stops being optional. You can finish a 10k on enthusiasm and general fitness. Twenty-one kilometres will find whatever you skipped.",
        ],
      },
      {
        heading: "Go slower",
        body: [
          "The most common mistake in a first training block is running every session at roughly the same moderately hard effort. It feels productive and it produces a plateau followed by an injury.",
          "The structure that works is unglamorous: two easy runs at a pace where you could hold a conversation, and one longer run that increases by about ten percent a week. That is it for the first eight weeks.",
        ],
        quote: "If you can't talk in full sentences on an easy run, it isn't an easy run.",
      },
      {
        heading: "The last three weeks",
        body: [
          "Peak long run around eighteen kilometres, then taper. The taper is where discipline gets tested, because you will feel fresh and want to prove something ten days out. Do not.",
          "Race day: start slower than your target pace for the first three kilometres. Everyone who runs a good first half says this and almost nobody does it.",
        ],
        list: [
          "Nothing new on race day — shoes, food, or clothing.",
          "Practise drinking while moving; it is harder than it looks.",
          "Plan for the fifteen-kilometre wall before you hit it.",
        ],
      },
    ],
  },
];

export const demoPages = [
  {
    title: "About",
    slug: "about",
    metaDescription:
      "About this blog — what it covers, who writes it, and how to get in touch.",
    content: `
<p class="lead">This is a place for long-form writing about technology, design and the habits that surround them — published on a domain I own, at whatever pace the ideas arrive.</p>
<p>Everything here is written by hand. Posts go out roughly weekly, and the newsletter is the most reliable way to hear about them.</p>
<h2>What you will find</h2>
<p>Essays on how software gets built and why it so often does not. Practical guides that assume you are busy. Occasional detours into photography, cities and whatever book has taken over the month.</p>
<h2>What you will not</h2>
<p>Sponsored posts disguised as recommendations, affiliate roundups, or anything written to hit a keyword.</p>
<h2>Get in touch</h2>
<p>Corrections are genuinely welcome, and so are arguments. The contact page has the details.</p>
`,
  },
  {
    title: "Contact",
    slug: "contact",
    metaDescription: "How to get in touch — email, social, and what gets a reply.",
    content: `
<p class="lead">The fastest way to reach me is email. I read everything and reply to most things, usually within a week.</p>
<h2>What gets a reply</h2>
<ul>
  <li>Corrections and factual disputes — always, and thank you.</li>
  <li>Questions about something specific in a post.</li>
  <li>Speaking, writing and consulting enquiries.</li>
</ul>
<h2>What probably does not</h2>
<ul>
  <li>Guest post offers and link insertions.</li>
  <li>Anything addressed to "Dear Webmaster".</li>
</ul>
`,
  },
  {
    title: "Privacy Policy",
    slug: "privacy",
    metaDescription:
      "What data this site collects, how it is used, and how to opt out.",
    content: `
<p class="lead">Short version: this site collects as little as it can get away with, and never sells anything about you.</p>
<h2>Analytics</h2>
<p>Aggregate, privacy-respecting analytics are used to understand which posts people read. No personal profiles are built and no data is sold.</p>
<h2>Comments</h2>
<p>If you leave a comment, the name, email address and comment text you submit are stored so the comment can be displayed and moderated. Your email address is never published or shared.</p>
<h2>Newsletter</h2>
<p>If you subscribe, your email address is stored for the sole purpose of sending posts. Every email includes an unsubscribe link, and unsubscribing deletes the record.</p>
<h2>Advertising</h2>
<p>If advertising is enabled on this site, third-party vendors including Google may use cookies to serve ads based on prior visits. You can opt out of personalised advertising through Google's Ads Settings.</p>
<h2>Contact</h2>
<p>For any question about data held about you — including deletion requests — use the contact page.</p>
`,
  },
];

export const demoComments = [
  {
    postSlug: "the-quiet-return-of-the-personal-website",
    authorName: "Marta Oyelaran",
    authorEmail: "marta@example.com",
    content:
      "The point about the reasoning versus the summary is the one that stuck with me. I went back through our decision log and almost none of it explains why — it just records what. Fixing that this week.",
    status: "approved" as const,
    daysAgo: 1,
  },
  {
    postSlug: "the-quiet-return-of-the-personal-website",
    authorName: "Dev Rai",
    authorEmail: "dev@example.com",
    website: "https://example.com",
    content:
      "Moved my archive off a platform last year and the migration was genuinely the easy part. The hard part was rebuilding the habit of publishing without an engagement number telling me it mattered.",
    status: "approved" as const,
    daysAgo: 1,
  },
  {
    postSlug: "typography-for-people-who-are-not-typographers",
    authorName: "Anneke Vermeer",
    authorEmail: "anneke@example.com",
    content:
      "Would add one: check your headings on a 320px viewport. Half the sites I audit have a beautiful type scale that collapses into four-word orphan lines on a small phone.",
    status: "approved" as const,
    daysAgo: 3,
  },
  {
    postSlug: "small-models-big-deployments",
    authorName: "Tunde Balogun",
    authorEmail: "tunde@example.com",
    content:
      "The cascade pattern is exactly what we landed on after six months of trying to make one model do everything. Cost dropped about 11x and p95 latency went from 2.4s to 180ms.",
    status: "approved" as const,
    daysAgo: 8,
  },
  {
    postSlug: "how-much-sleep-debt-can-you-repay",
    authorName: "Priya Nadar",
    authorEmail: "priya@example.com",
    content:
      "Do you have a source for the glucose metabolism claim? Would like to read the primary study rather than the coverage of it.",
    status: "approved" as const,
    daysAgo: 5,
  },
  {
    postSlug: "practical-guide-to-deep-work",
    authorName: "Someone In A Hurry",
    authorEmail: "spam@example.com",
    website: "https://buy-followers.example",
    content:
      "GREAT POST!!! Check out my site for cheap traffic and instant SEO ranking guaranteed!!!",
    status: "spam" as const,
    daysAgo: 2,
  },
  {
    postSlug: "designing-an-admin-interface",
    authorName: "Kwabena Mensah",
    authorEmail: "kwabena@example.com",
    content:
      "Undo instead of confirmation dialogs is the single best change we made to our internal tools. Support tickets about accidental deletion went to zero and nobody misses the modals.",
    status: "pending" as const,
    daysAgo: 0,
  },
  {
    postSlug: "eight-months-of-fully-remote-work",
    authorName: "Ivy Chen",
    authorEmail: "ivy@example.com",
    content:
      "Curious how you handled the apprenticeship gap for interns specifically. We tried recorded pairing sessions and the engagement was terrible.",
    status: "pending" as const,
    daysAgo: 0,
  },
];

export const demoSubscribers = [
  "reader.one@example.com",
  "reader.two@example.com",
  "hello@example.org",
  "subscriber@example.net",
  "newsletter.fan@example.com",
];
