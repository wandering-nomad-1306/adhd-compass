import type { SeoConfig } from "../shared/seo";

export function getStaticBodyHtml(pathname: string, seo: SeoConfig): string {
  const normPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/chapter/welcome", label: "Welcome" },
    { href: "/chapter/why-feels", label: "Why It Feels Like This" },
    { href: "/chapter/what-is", label: "What is ADHD?" },
    { href: "/chapter/brain", label: "Meet Your Brain" },
    { href: "/chapter/brain/executive-functions", label: "Executive Functions" },
    { href: "/chapter/what-helps", label: "What Actually Helps" },
    { href: "/chapter/medication", label: "Medication Guide" },
    { href: "/chapter/getting-diagnosed", label: "Getting Diagnosed" },
    { href: "/chapter/getting-diagnosed/test", label: "Self-Screening Test" },
    { href: "/chapter/accommodations", label: "Accommodations" },
    { href: "/about", label: "About & Evidence" },
  ];

  const headerHtml = `
    <header style="background: #ffffff; border-bottom: 1px solid rgba(79, 118, 89, 0.2); padding: 1rem 1.5rem;">
      <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem;">
        <a href="/" style="font-family: serif; font-size: 1.5rem; font-weight: bold; color: #34533d; text-decoration: none;">ADHD Compass</a>
        <nav aria-label="Main Site Navigation" style="display: flex; flex-wrap: wrap; gap: 0.75rem 1.25rem; font-size: 0.875rem;">
          ${navLinks
            .map(
              (l) =>
                `<a href="${l.href}" style="color: ${
                  l.href === normPath ? "#34533d; font-weight: bold; text-decoration: underline;" : "#555555; text-decoration: none;"
                }">${l.label}</a>`,
            )
            .join("")}
        </nav>
      </div>
    </header>
  `;

  const footerHtml = `
    <footer style="background: #fbf8f0; border-top: 1px solid rgba(79, 118, 89, 0.15); padding: 2.5rem 1.5rem; margin-top: 3rem; font-size: 0.875rem; color: #5f554d;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2rem; margin-bottom: 1.5rem;">
          <div>
            <h3 style="font-family: serif; font-size: 1.25rem; color: #231d17; margin-bottom: 0.5rem;">ADHD Compass</h3>
            <p style="margin: 0.25rem 0; color: #4f7659; font-weight: 600;">Free forever · Evidence-based · Independent educational initiative</p>
            <p style="margin: 0.25rem 0; max-width: 600px;">Translating ADHD neurobiology, pharmacology, and lived experiences into accessible insights. Not medical advice or diagnostic services.</p>
          </div>
          <nav aria-label="Footer Navigation" style="display: flex; flex-direction: column; gap: 0.5rem;">
            <a href="/about" style="color: #4f7659; text-decoration: underline;">About ADHD Compass</a>
            <a href="/about#sources" style="color: #4f7659; text-decoration: underline;">How evidence is used & Citations</a>
            <a href="/about#privacy" style="color: #4f7659; text-decoration: underline;">Privacy Policy (100% Client-Side)</a>
            <a href="mailto:myadhdcompass@gmail.com" style="color: #4f7659; text-decoration: underline;">Contact / corrections</a>
          </nav>
        </div>
        <div style="border-top: 1px solid rgba(79, 118, 89, 0.1); padding-top: 1rem; display: flex; justify-content: space-between; flex-wrap: wrap; font-size: 0.75rem;">
          <span>© 2026 ADHD Compass. Educational non-profit initiative.</span>
          <span>Contact: myadhdcompass@gmail.com</span>
        </div>
      </div>
    </footer>
  `;

  let mainContentHtml = "";

  if (normPath === "/chapter/medication") {
    mainContentHtml = `
      <article style="max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem; font-family: system-ui, sans-serif; line-height: 1.7; color: #231d17;">
        <nav aria-label="Breadcrumbs" style="font-size: 0.875rem; margin-bottom: 1.5rem; color: #666;">
          <a href="/" style="color: #4f7659; text-decoration: none;">Home</a> &gt; <span>Chapter 6: Medication Guide</span>
        </nav>

        <header style="margin-bottom: 2.5rem;">
          <span style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #4e72a2; background: rgba(78, 114, 162, 0.1); padding: 0.35rem 0.75rem; rounded: 9999px;">Chapter 6 · Pharmacotherapy</span>
          <h1 style="font-family: serif; font-size: 2.5rem; font-weight: bold; margin-top: 0.75rem; margin-bottom: 1rem; line-height: 1.2; color: #1c2833;">ADHD Medication Guide: Mechanisms, Classes & Considerations</h1>
          <p style="font-size: 1.15rem; color: #555; line-height: 1.6;">An objective, evidence-based guide to adult ADHD medications: stimulant vs non-stimulant pharmacology, cellular receptor mechanisms, release profiles, titration, and managing side effects safely.</p>
        </header>

        <section style="background: rgba(169, 105, 82, 0.06); border: 1px solid rgba(169, 105, 82, 0.25); border-radius: 1rem; padding: 1.5rem; margin-bottom: 2.5rem;">
          <h2 style="font-family: serif; font-size: 1.4rem; color: #a96952; margin-top: 0;">Clinical Notice & Medical Disclaimer</h2>
          <p>This is educational clinical information synthesized from international practice parameters (AAP 2019, AACAP), network meta-analyses (Cortese et al., <em>Lancet Psychiatry</em> 2018), and FDA DailyMed prescribing information. Dosages and parameters illustrate pharmacological distinctions and regulatory approvals. Never initiate, alter, combine, taper, or stop psychiatric medication without direct guidance from a licensed medical prescriber.</p>
        </section>

        <section style="margin-bottom: 3rem;">
          <h2 style="font-family: serif; font-size: 1.85rem; color: #231d17; border-bottom: 2px solid rgba(79,118,89,0.2); padding-bottom: 0.5rem;">What Medication Can and Cannot Do</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
            <div style="background: #ffffff; border: 1px solid rgba(79, 118, 89, 0.2); border-radius: 1rem; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
              <h3 style="color: #34533d; font-size: 1.25rem; margin-top: 0;">What Medication Can Do</h3>
              <ul>
                <li>Substantially reduce inattention, hyperactivity, and impulsivity while pharmacologically active.</li>
                <li>Enhance prefrontal cortex signal-to-noise ratio, improving working memory, response inhibition, and sustained effort.</li>
                <li>Reduce functional impairment across academic, workplace, driving, and social settings.</li>
                <li>Lower long-term risks of motor vehicle accidents, accidental physical injuries, and academic underachievement (Faraone et al., 2021).</li>
                <li>Stabilize neurochemical signaling so behavioral strategies, coaching, and accommodations can be effectively implemented.</li>
              </ul>
            </div>
            <div style="background: #ffffff; border: 1px solid rgba(169, 105, 82, 0.25); border-radius: 1rem; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
              <h3 style="color: #a96952; font-size: 1.25rem; margin-top: 0;">What Medication Cannot Do Alone</h3>
              <ul>
                <li>Cure ADHD or permanently reorganize neurodevelopmental circuits after treatment discontinuation.</li>
                <li>Automatically teach organizational habits, calendar systems, emotional regulation, or study techniques.</li>
                <li>Remediate learning disabilities, unsupportive workplace cultures, or chronic sleep debt.</li>
                <li>Guarantee intrinsic motivation for tasks perceived as meaningless without deliberate environmental scaffolding.</li>
              </ul>
            </div>
          </div>
        </section>

        <section style="margin-bottom: 3rem;">
          <h2 style="font-family: serif; font-size: 1.85rem; color: #231d17; border-bottom: 2px solid rgba(79,118,89,0.2); padding-bottom: 0.5rem;">The Three Major Medication Pathways</h2>
          
          <div style="margin-top: 1.5rem;">
            <h3 style="color: #4e72a2; font-size: 1.35rem;">1. Stimulants: Methylphenidate &amp; Amphetamines (First-Line)</h3>
            <p>Central nervous system stimulants represent the most empirically validated first-line treatment for ADHD. In Cortese et al.'s landmark network meta-analysis of 133 randomized controlled trials (<em>Lancet Psychiatry</em> 2018), stimulants demonstrated an effect size of 0.7 to 1.0, with 70% to 80% of children and adults experiencing significant clinical response.</p>
            <ul>
              <li><strong>Methylphenidate class (Ritalin, Concerta, Focalin, Quillivant):</strong> Primarily acts as a reuptake inhibitor blocking the dopamine transporter (DAT) and norepinephrine transporter (NET).</li>
              <li><strong>Amphetamine class (Adderall, Vyvanse, Dexedrine):</strong> Dual-action mechanism—blocks reuptake via DAT/NET and promotes active release of dopamine and norepinephrine from presynaptic vesicles into the synaptic cleft.</li>
            </ul>

            <h3 style="color: #4e72a2; font-size: 1.35rem; margin-top: 1.75rem;">2. Selective Norepinephrine Reuptake Inhibitors (SNRIs / Non-Stimulants)</h3>
            <p>Non-stimulant medications provide 24-hour symptom coverage without schedule-II regulatory restrictions and without potential for abuse. They are indicated when stimulants cause intolerable cardiovascular side effects, exacerbate tics or severe anxiety, or when continuous all-day coverage is preferred.</p>
            <ul>
              <li><strong>Atomoxetine (Strattera):</strong> Selectively blocks prefrontal norepinephrine transporters (NET). Because NET also transports dopamine in the prefrontal cortex, it elevates both dopamine and norepinephrine specifically in executive regions without increasing dopamine in the nucleus accumbens. Requires 2 to 6 weeks of continuous daily administration to reach full clinical efficacy.</li>
              <li><strong>Viloxazine (Qelbree):</strong> A selective norepinephrine reuptake inhibitor with 5-HT2B and 5-HT2C receptor antagonist activity approved for children, adolescents, and adults.</li>
            </ul>

            <h3 style="color: #4e72a2; font-size: 1.35rem; margin-top: 1.75rem;">3. Alpha-2 Adrenergic Agonists</h3>
            <p>Originally formulated as antihypertensives, extended-release alpha-2 agonists directly engage postsynaptic alpha-2A adrenergic receptors in the prefrontal cortex, strengthening dendritic spine connections and improving working memory and impulse control.</p>
            <ul>
              <li><strong>Guanfacine ER (Intuniv):</strong> Highly selective for alpha-2A receptors, reducing hyperarousal, emotional reactivity, and oppositional symptoms with less sedation than clonidine.</li>
              <li><strong>Clonidine ER (Kapvay):</strong> Non-selective alpha-2 agonist (acts on alpha-2A, 2B, 2C), frequently beneficial for co-occurring severe sleep disturbances and motor/vocal tics.</li>
            </ul>
          </div>
        </section>

        <section style="margin-bottom: 3rem;">
          <h2 style="font-family: serif; font-size: 1.85rem; color: #231d17; border-bottom: 2px solid rgba(79,118,89,0.2); padding-bottom: 0.5rem;">Cellular Neuroscience: The Prefrontal Signal-to-Noise Ratio</h2>
          <p>Research by Dr. Amy Arnsten (Yale School of Medicine) demonstrates that optimal prefrontal cortex functioning follows an inverted-U curve governed by dopamine and norepinephrine:</p>
          <ul>
            <li><strong>Norepinephrine strengthens the SIGNAL:</strong> By binding to high-affinity post-synaptic alpha-2A receptors, norepinephrine amplifies neural firing for priority goals and working memory tasks.</li>
            <li><strong>Dopamine mutes the NOISE:</strong> By stimulating D1 receptors in prefrontal microcircuits, dopamine suppresses irrelevant background neuronal firing, quieting internal chatter and distracting sensory inputs.</li>
          </ul>
        </section>

        <section style="margin-bottom: 3rem;">
          <h2 style="font-family: serif; font-size: 1.85rem; color: #231d17; border-bottom: 2px solid rgba(79,118,89,0.2); padding-bottom: 0.5rem;">Frequently Asked Questions</h2>
          <div style="margin-top: 1.5rem;">
            <div style="margin-bottom: 1.5rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem;">
              <h3 style="font-size: 1.15rem; color: #1c2833; margin-top: 0;">What is the difference between methylphenidate and amphetamine for ADHD?</h3>
              <p style="margin-bottom: 0;">Methylphenidate (Ritalin, Concerta) acts primarily as a reuptake inhibitor blocking DAT and NET transporters, while amphetamines (Adderall, Vyvanse) both block reuptake and stimulate presynaptic dopamine release.</p>
            </div>
            <div style="margin-bottom: 1.5rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem;">
              <h3 style="font-size: 1.15rem; color: #1c2833; margin-top: 0;">How effective are ADHD medications according to peer-reviewed evidence?</h3>
              <p style="margin-bottom: 0;">Network meta-analyses (Cortese et al., Lancet Psychiatry 2018) demonstrate an effect size of 0.7 to 1.0 for stimulants, with 70% to 80% of individuals experiencing substantial clinical benefit.</p>
            </div>
          </div>
        </section>

        <nav aria-label="Chapter Progression" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 2rem; margin-top: 3rem; flex-wrap: wrap; gap: 1rem;">
          <a href="/chapter/what-helps" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border: 1px solid rgba(79,118,89,0.3); border-radius: 0.5rem; color: #4f7659; font-weight: bold; text-decoration: none;">&larr; Previous: What Actually Helps</a>
          <a href="/chapter/getting-diagnosed" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border: 1px solid rgba(79,118,89,0.3); border-radius: 0.5rem; color: #4f7659; font-weight: bold; text-decoration: none;">Next: Getting Diagnosed &rarr;</a>
        </nav>
      </article>
    `;
  } else if (normPath === "/chapter/what-helps") {
    mainContentHtml = `
      <article style="max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem; font-family: system-ui, sans-serif; line-height: 1.7; color: #231d17;">
        <nav aria-label="Breadcrumbs" style="font-size: 0.875rem; margin-bottom: 1.5rem; color: #666;">
          <a href="/" style="color: #4f7659; text-decoration: none;">Home</a> &gt; <span>Chapter 5: What Actually Helps</span>
        </nav>

        <header style="margin-bottom: 2.5rem;">
          <span style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #925e76; background: rgba(146, 94, 118, 0.1); padding: 0.35rem 0.75rem; rounded: 9999px;">Chapter 5 · Practical Support</span>
          <h1 style="font-family: serif; font-size: 2.5rem; font-weight: bold; margin-top: 0.75rem; margin-bottom: 1rem; line-height: 1.2; color: #1c2833;">What Actually Helps ADHD: Practical Strategies &amp; Evidence-Based Care</h1>
          <p style="font-size: 1.15rem; color: #555; line-height: 1.6;">Practical, research-backed interventions for adult ADHD: externalizing working memory, body doubling, environmental design, behavioral psychotherapy, and breaking task paralysis gently.</p>
        </header>

        <section style="margin-bottom: 3rem;">
          <h2 style="font-family: serif; font-size: 1.85rem; color: #231d17; border-bottom: 2px solid rgba(79,118,89,0.2); padding-bottom: 0.5rem;">Strategies for Common ADHD Bottlenecks</h2>
          
          <div style="margin-top: 1.5rem;">
            <h3 style="color: #34533d; font-size: 1.35rem;">1. Task Initiation &amp; Breaking Paralysis</h3>
            <p>Task initiation difficulties stem from delayed dopamine transmission when contemplating multi-step responsibilities. Standard advice to "just do it" fails because executive networks experience an energy barrier. Concrete strategies:</p>
            <ul>
              <li><strong>The 2-Minute Micro-Step:</strong> Shrink the starting requirement until resistance disappears (e.g., opening the document and typing one sentence, rather than "writing the report").</li>
              <li><strong>Visualizing the Physical Starting Gesture:</strong> Focus solely on physical movement (touching the keyboard, opening the notebook) rather than the outcome.</li>
              <li><strong>Body Doubling:</strong> Working alongside another person—whether in person, over video, or via co-working sessions—stimulates prefrontal activation and social accountability.</li>
            </ul>

            <h3 style="color: #34533d; font-size: 1.35rem; margin-top: 1.75rem;">2. Time Blindness &amp; Pacing</h3>
            <p>ADHD impairs the internal cognitive clock. To manage time blindness:</p>
            <ul>
              <li><strong>Visual Timers:</strong> Use physical timers with visible disappearing colored discs (like the Time Timer) to render time passage concrete and visible.</li>
              <li><strong>Buffer Blocks &amp; Backward Scheduling:</strong> Calculate transit and preparation times in reverse, adding 25% buffer time for inevitable cognitive friction.</li>
            </ul>

            <h3 style="color: #34533d; font-size: 1.35rem; margin-top: 1.75rem;">3. Externalizing Working Memory</h3>
            <p>Because working memory decays rapidly under distraction, information must live outside the brain:</p>
            <ul>
              <li><strong>One Single Calendar &amp; One Capture Inbox:</strong> Consolidate notes into a single physical notebook or notes app to eliminate the panic of scattered reminders.</li>
              <li><strong>Physical Landing Zones:</strong> Design dedicated dishes or wall hooks for keys, medication, and wallet right at the entrance.</li>
            </ul>
          </div>
        </section>

        <section style="margin-bottom: 3rem;">
          <h2 style="font-family: serif; font-size: 1.85rem; color: #231d17; border-bottom: 2px solid rgba(79,118,89,0.2); padding-bottom: 0.5rem;">Evidence-Based Non-Pharmacological Care</h2>
          <p>Personal habits operate within a multimodal care ecosystem. Four clinical modalities hold empirical backing:</p>
          <ul>
            <li><strong>ADHD-Adapted Cognitive Behavioral Therapy (CBT):</strong> Targets emotional regulation, perfectionistic avoidance, and executive skills through structured cognitive restructuring.</li>
            <li><strong>Executive Function Coaching:</strong> Hands-on behavioral scaffolding focused on daily systems, routines, and accountability.</li>
            <li><strong>Aerobic Exercise:</strong> Stimulates release of dopamine, norepinephrine, and brain-derived neurotrophic factor (BDNF), sharpening executive attention for several hours post-exercise.</li>
            <li><strong>Sleep Architecture Optimization:</strong> Treating comorbid delayed sleep phase syndrome (DSPS) or sleep apnea dramatically reduces executive dysfunction.</li>
          </ul>
        </section>

        <section style="background: rgba(79, 118, 89, 0.08); border: 1px solid rgba(79, 118, 89, 0.2); border-radius: 1rem; padding: 1.5rem; margin-bottom: 3rem;">
          <h2 style="font-family: serif; font-size: 1.4rem; color: #34533d; margin-top: 0;">Explore the Medical Care Pathway</h2>
          <p>Stimulant and nonstimulant medications represent the most empirically validated first-line treatment for core ADHD neurobiology, supporting dopamine and norepinephrine signaling in brain circuits.</p>
          <a href="/chapter/medication" style="display: inline-block; background: #34533d; color: #ffffff; padding: 0.75rem 1.25rem; border-radius: 0.5rem; font-weight: bold; text-decoration: none; margin-top: 0.5rem;">Open the Medication Guide &rarr;</a>
        </section>

        <nav aria-label="Chapter Progression" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 2rem; margin-top: 3rem; flex-wrap: wrap; gap: 1rem;">
          <a href="/chapter/brain" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border: 1px solid rgba(79,118,89,0.3); border-radius: 0.5rem; color: #4f7659; font-weight: bold; text-decoration: none;">&larr; Previous: Meet Your Brain</a>
          <a href="/chapter/medication" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border: 1px solid rgba(79,118,89,0.3); border-radius: 0.5rem; color: #4f7659; font-weight: bold; text-decoration: none;">Next: Medication Guide &rarr;</a>
        </nav>
      </article>
    `;
  } else if (normPath === "/chapter/brain/executive-functions") {
    mainContentHtml = `
      <article style="max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem; font-family: system-ui, sans-serif; line-height: 1.7; color: #231d17;">
        <nav aria-label="Breadcrumbs" style="font-size: 0.875rem; margin-bottom: 1.5rem; color: #666;">
          <a href="/" style="color: #4f7659; text-decoration: none;">Home</a> &gt; <a href="/chapter/brain" style="color: #4f7659; text-decoration: none;">Meet Your Brain</a> &gt; <span>Executive Functions</span>
        </nav>

        <header style="margin-bottom: 2.5rem;">
          <span style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #335d64; background: rgba(51, 93, 100, 0.1); padding: 0.35rem 0.75rem; rounded: 9999px;">Chapter 4 Deep Dive · Executive Functions</span>
          <h1 style="font-family: serif; font-size: 2.5rem; font-weight: bold; margin-top: 0.75rem; margin-bottom: 1rem; line-height: 1.2; color: #1c2833;">ADHD Executive Dysfunction &amp; Working Memory</h1>
          <p style="font-size: 1.15rem; color: #555; line-height: 1.6;">How goals become actions: understand working memory decay, impulse inhibition, set shifting, and practical cognitive scaffolding for executive dysfunction.</p>
        </header>

        <section style="margin-bottom: 3rem;">
          <h2 style="font-family: serif; font-size: 1.85rem; color: #231d17; border-bottom: 2px solid rgba(79,118,89,0.2); padding-bottom: 0.5rem;">What Executive Function Actually Is</h2>
          <p style="margin-top: 1.5rem;">Executive functions are a family of top-down mental control processes orchestrated by the prefrontal cortex and its striatal connections. They allow you to plan, focus attention, remember instructions, juggle multiple tasks, and regulate emotional impulses. Researchers distinguish three core cognitive pillars:</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; margin-top: 1.5rem;">
            <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem;">
              <h3 style="color: #335d64; margin-top: 0;">1. Working Memory</h3>
              <p style="font-size: 0.95rem; margin-bottom: 0;">Holding and manipulating information temporarily in mind while acting upon it. Allows you to follow multi-step directions and connect past consequences with immediate decisions.</p>
            </div>
            <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem;">
              <h3 style="color: #335d64; margin-top: 0;">2. Inhibitory Control</h3>
              <p style="font-size: 0.95rem; margin-bottom: 0;">Pausing before reacting. Suppressing prepotent impulses, resisting instant gratification, and filtering out distracting environmental or emotional noise.</p>
            </div>
            <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem;">
              <h3 style="color: #335d64; margin-top: 0;">3. Cognitive Flexibility</h3>
              <p style="font-size: 0.95rem; margin-bottom: 0;">Adjusting to unexpected obstacles, switching perspectives, changing strategies when an approach fails, and transitioning smoothly between activities.</p>
            </div>
          </div>
        </section>

        <section style="margin-bottom: 3rem;">
          <h2 style="font-family: serif; font-size: 1.85rem; color: #231d17; border-bottom: 2px solid rgba(79,118,89,0.2); padding-bottom: 0.5rem;">The Intention-Action Gap in ADHD</h2>
          <p style="margin-top: 1.5rem;">As characterized by clinical neuropsychologist Dr. Russell Barkley, ADHD is not a disorder of knowing what to do—it is a disorder of <em>doing what you know at the point of performance</em>.</p>
          <p>Individuals with ADHD frequently understand their responsibilities, possess the necessary skills, and deeply care about outcomes. However, prefrontal dopamine and norepinephrine transmission delays impair the real-time activation required to translate intent into immediate physical action.</p>
          
          <div style="background: #f7f9f8; border-left: 4px solid #335d64; padding: 1rem 1.25rem; margin: 1.5rem 0;">
            <p style="font-weight: 600; color: #1c2833; margin: 0;">Why structured tests differ from daily life:</p>
            <p style="margin: 0.5rem 0 0; font-size: 0.95rem; color: #555;">Formal neuropsychological tests evaluate executive functions in quiet, structured environments with an examiner providing external scaffolding. Real-world executive functioning requires self-initiating and self-regulating amidst distractions, fatigue, and open-ended deadlines.</p>
          </div>
        </section>

        <section style="margin-bottom: 3rem;">
          <h2 style="font-family: serif; font-size: 1.85rem; color: #231d17; border-bottom: 2px solid rgba(79,118,89,0.2); padding-bottom: 0.5rem;">Practical Scaffolding Principles</h2>
          <p>Support does not require altering basic personality traits. The objective is to engineer point-of-performance accommodations that lower cognitive load:</p>
          <ul>
            <li><strong>Externalize working memory:</strong> Keep checklists, current goals, and timers in direct visual line of sight. If it is out of sight, it does not exist in working memory.</li>
            <li><strong>Break tasks into single-step physical actions:</strong> Eliminate the cognitive penalty of choosing what to do next.</li>
            <li><strong>Reduce friction for the next step:</strong> Prepare materials before ending a session to eliminate startup hesitation next time.</li>
          </ul>
        </section>

        <nav aria-label="Chapter Progression" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 2rem; margin-top: 3rem; flex-wrap: wrap; gap: 1rem;">
          <a href="/chapter/brain" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border: 1px solid rgba(79,118,89,0.3); border-radius: 0.5rem; color: #4f7659; font-weight: bold; text-decoration: none;">&larr; Previous: Meet Your Brain</a>
          <a href="/chapter/what-helps" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border: 1px solid rgba(79,118,89,0.3); border-radius: 0.5rem; color: #4f7659; font-weight: bold; text-decoration: none;">Next: What Actually Helps &rarr;</a>
        </nav>
      </article>
    `;
  } else if (normPath === "/") {
    mainContentHtml = `
      <div style="max-width: 1100px; margin: 0 auto; padding: 3rem 1.5rem; font-family: system-ui, sans-serif; line-height: 1.7; color: #231d17;">
        <header style="text-align: center; margin-bottom: 3.5rem;">
          <span style="font-size: 0.85rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.18em; color: #4f7659; background: rgba(79,118,89,0.1); padding: 0.4rem 1rem; border-radius: 9999px;">Evidence-Based · Independent · Free Forever</span>
          <h1 style="font-family: serif; font-size: 3rem; font-weight: bold; margin-top: 1.25rem; margin-bottom: 1rem; color: #231d17; line-height: 1.15;">ADHD Compass: Interactive Neuroscience &amp; Clinical Guide</h1>
          <p style="font-size: 1.25rem; color: #555; max-width: 750px; margin: 0 auto;">Understand the ADHD brain through evidence-based cognitive neuroscience, interactive coping strategies, and clinical self-assessments.</p>
        </header>

        <section style="margin-bottom: 3.5rem;">
          <h2 style="font-family: serif; font-size: 2rem; text-align: center; margin-bottom: 2rem; color: #231d17;">Explore the Interactive Chapters</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
            <a href="/chapter/welcome" style="display: block; background: #fff; border: 1px solid rgba(79,118,89,0.2); border-radius: 1rem; padding: 1.5rem; text-decoration: none; color: inherit; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
              <span style="font-size: 0.75rem; font-weight: bold; color: #4f7659; text-transform: uppercase;">Chapter 1</span>
              <h3 style="font-family: serif; font-size: 1.35rem; color: #231d17; margin: 0.35rem 0;">Welcome &amp; Grounding</h3>
              <p style="font-size: 0.95rem; color: #666; margin: 0;">Pacing your reading, gentle orientation, and navigating ADHD without cognitive overload.</p>
            </a>
            <a href="/chapter/why-feels" style="display: block; background: #fff; border: 1px solid rgba(79,118,89,0.2); border-radius: 1rem; padding: 1.5rem; text-decoration: none; color: inherit; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
              <span style="font-size: 0.75rem; font-weight: bold; color: #7e8249; text-transform: uppercase;">Chapter 2</span>
              <h3 style="font-family: serif; font-size: 1.35rem; color: #231d17; margin: 0.35rem 0;">Why It Feels Like This</h3>
              <p style="font-size: 0.95rem; color: #666; margin: 0;">Task paralysis, time blindness, rejection sensitivity, and deadline adrenaline explained without self-blame.</p>
            </a>
            <a href="/chapter/what-is" style="display: block; background: #fff; border: 1px solid rgba(79,118,89,0.2); border-radius: 1rem; padding: 1.5rem; text-decoration: none; color: inherit; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
              <span style="font-size: 0.75rem; font-weight: bold; color: #a96952; text-transform: uppercase;">Chapter 3</span>
              <h3 style="font-family: serif; font-size: 1.35rem; color: #231d17; margin: 0.35rem 0;">What is ADHD?</h3>
              <p style="font-size: 0.95rem; color: #666; margin: 0;">DSM-5-TR diagnostic criteria, presentations (inattentive, hyperactive, combined), and debunking willpower myths.</p>
            </a>
            <a href="/chapter/brain" style="display: block; background: #fff; border: 1px solid rgba(79,118,89,0.2); border-radius: 1rem; padding: 1.5rem; text-decoration: none; color: inherit; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
              <span style="font-size: 0.75rem; font-weight: bold; color: #5b6f96; text-transform: uppercase;">Chapter 4</span>
              <h3 style="font-family: serif; font-size: 1.35rem; color: #231d17; margin: 0.35rem 0;">Meet Your Brain</h3>
              <p style="font-size: 0.95rem; color: #666; margin: 0;">Prefrontal cortex, default mode network, striatum, and dopamine-norepinephrine signaling dynamics.</p>
            </a>
            <a href="/chapter/brain/executive-functions" style="display: block; background: #fff; border: 1px solid rgba(51,93,100,0.25); border-radius: 1rem; padding: 1.5rem; text-decoration: none; color: inherit; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
              <span style="font-size: 0.75rem; font-weight: bold; color: #335d64; text-transform: uppercase;">Chapter 4 Deep Dive</span>
              <h3 style="font-family: serif; font-size: 1.35rem; color: #231d17; margin: 0.35rem 0;">Executive Functions</h3>
              <p style="font-size: 0.95rem; color: #666; margin: 0;">Working memory decay, impulse inhibition, set shifting, and practical executive scaffolding.</p>
            </a>
            <a href="/chapter/what-helps" style="display: block; background: #fff; border: 1px solid rgba(79,118,89,0.2); border-radius: 1rem; padding: 1.5rem; text-decoration: none; color: inherit; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
              <span style="font-size: 0.75rem; font-weight: bold; color: #925e76; text-transform: uppercase;">Chapter 5</span>
              <h3 style="font-family: serif; font-size: 1.35rem; color: #231d17; margin: 0.35rem 0;">What Actually Helps</h3>
              <p style="font-size: 0.95rem; color: #666; margin: 0;">Practical interventions: externalizing memory, body doubling, sensory adjustments, and CBT tools.</p>
            </a>
            <a href="/chapter/medication" style="display: block; background: #fff; border: 1px solid rgba(78,114,162,0.25); border-radius: 1rem; padding: 1.5rem; text-decoration: none; color: inherit; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
              <span style="font-size: 0.75rem; font-weight: bold; color: #4e72a2; text-transform: uppercase;">Chapter 6</span>
              <h3 style="font-family: serif; font-size: 1.35rem; color: #231d17; margin: 0.35rem 0;">Medication Guide</h3>
              <p style="font-size: 0.95rem; color: #666; margin: 0;">Objective clinical pharmacology: stimulants (methylphenidate, amphetamine), non-stimulants, and titration.</p>
            </a>
            <a href="/chapter/getting-diagnosed" style="display: block; background: #fff; border: 1px solid rgba(79,118,89,0.2); border-radius: 1rem; padding: 1.5rem; text-decoration: none; color: inherit; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
              <span style="font-size: 0.75rem; font-weight: bold; color: #9a7648; text-transform: uppercase;">Chapter 7</span>
              <h3 style="font-family: serif; font-size: 1.35rem; color: #231d17; margin: 0.35rem 0;">Getting Diagnosed</h3>
              <p style="font-size: 0.95rem; color: #666; margin: 0;">The evaluation process: clinical interviews, childhood documentation, ruling out lookalikes, and finding specialists.</p>
            </a>
            <a href="/chapter/getting-diagnosed/test" style="display: block; background: #fff; border: 1px solid rgba(79,118,89,0.2); border-radius: 1rem; padding: 1.5rem; text-decoration: none; color: inherit; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
              <span style="font-size: 0.75rem; font-weight: bold; color: #477f72; text-transform: uppercase;">Self-Assessment</span>
              <h3 style="font-family: serif; font-size: 1.35rem; color: #231d17; margin: 0.35rem 0;">Adult ADHD Screening Test</h3>
              <p style="font-size: 0.95rem; color: #666; margin: 0;">Private, client-side 18-question WHO ASRS-v1.1 screener based on DSM-5 symptom criteria.</p>
            </a>
            <a href="/chapter/accommodations" style="display: block; background: #fff; border: 1px solid rgba(79,118,89,0.2); border-radius: 1rem; padding: 1.5rem; text-decoration: none; color: inherit; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
              <span style="font-size: 0.75rem; font-weight: bold; color: #477f72; text-transform: uppercase;">Chapter 8</span>
              <h3 style="font-family: serif; font-size: 1.35rem; color: #231d17; margin: 0.35rem 0;">Accommodations</h3>
              <p style="font-size: 0.95rem; color: #666; margin: 0;">Workplace and academic reasonable adjustments under the ADA and Equality Act.</p>
            </a>
          </div>
        </section>
      </div>
    `;
  } else {
    // Default fallback chapter layout generator
    mainContentHtml = `
      <article style="max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem; font-family: system-ui, sans-serif; line-height: 1.7; color: #231d17;">
        <nav aria-label="Breadcrumbs" style="font-size: 0.875rem; margin-bottom: 1.5rem; color: #666;">
          <a href="/" style="color: #4f7659; text-decoration: none;">Home</a> &gt; <span>${seo.title.split("|")[0].trim()}</span>
        </nav>

        <header style="margin-bottom: 2.5rem;">
          <h1 style="font-family: serif; font-size: 2.5rem; font-weight: bold; margin-top: 0.75rem; margin-bottom: 1rem; line-height: 1.2; color: #1c2833;">${seo.title.split("|")[0].trim()}</h1>
          <p style="font-size: 1.15rem; color: #555; line-height: 1.6;">${seo.description}</p>
        </header>

        ${
          seo.faqItems && seo.faqItems.length > 0
            ? `
          <section style="margin-top: 2rem; margin-bottom: 3rem;">
            <h2 style="font-family: serif; font-size: 1.75rem; color: #231d17; border-bottom: 2px solid rgba(79,118,89,0.2); padding-bottom: 0.5rem;">Frequently Asked Questions</h2>
            <div style="margin-top: 1.5rem;">
              ${seo.faqItems
                .map(
                  (f) => `
                <div style="margin-bottom: 1.5rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem;">
                  <h3 style="font-size: 1.15rem; color: #1c2833; margin-top: 0;">${f.question}</h3>
                  <p style="margin-bottom: 0;">${f.answer}</p>
                </div>
              `,
                )
                .join("")}
            </div>
          </section>
        `
            : ""
        }

        <nav aria-label="Explore other chapters" style="border-top: 1px solid #e2e8f0; padding-top: 2rem; margin-top: 3rem;">
          <p style="font-weight: bold; color: #4f7659;">Continue Exploring ADHD Compass:</p>
          <ul style="display: flex; flex-wrap: wrap; gap: 0.75rem 1.5rem; list-style: none; padding: 0;">
            <li><a href="/chapter/what-helps" style="color: #34533d; font-weight: 600; text-decoration: underline;">What Actually Helps</a></li>
            <li><a href="/chapter/medication" style="color: #34533d; font-weight: 600; text-decoration: underline;">Medication Guide</a></li>
            <li><a href="/chapter/brain/executive-functions" style="color: #34533d; font-weight: 600; text-decoration: underline;">Executive Functions</a></li>
            <li><a href="/chapter/getting-diagnosed" style="color: #34533d; font-weight: 600; text-decoration: underline;">Getting Diagnosed</a></li>
          </ul>
        </nav>
      </article>
    `;
  }

  return `
    ${headerHtml}
    <main id="main-content">
      ${mainContentHtml}
    </main>
    ${footerHtml}
  `;
}
