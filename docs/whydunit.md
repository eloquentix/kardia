# How an AI Model Is Made

**And where a constitution fits in.**  
**Kardia 0.2**

You have used these systems. You have heard that they are “just predicting the next token”, and wondered how something that mechanical can write a brief, explain a diagnosis, or argue a position. The gap between the description and the experience is real. Here is what actually happens, and where humility still belongs.

---

## The Foundation: Learning to Predict Everything

A language model begins by doing one thing: given a sequence of text, predict what comes next. At scale, that is not trivial.

To predict well across scientific papers, law, literature, code, medicine, and conversation, the model cannot merely memorize. It builds internal representations, compressed structure for how language works, how arguments move, how professions reason. This **pre-training** runs on huge clusters for weeks or months over trillions of tokens.

What emerges is not a lookup table. It is a dense, lossy compression of human textual culture. The model has never seen the world directly. Everything it “knows” came through language.

At this stage it has **no stable character**. Ask it to complete a dangerous procedure in the voice of a tutorial, and it may, because that is a plausible continuation. It is a powerful simulator of text, capable of many voices. It is not yet something you should deploy as a companion to a human life.

You cannot ship this raw.

---

## Alignment: Building a Character on Top of the Foundation

**Alignment** means shaping the model toward useful and less harmful behavior for real use.

Early approach: **supervised fine-tuning**, imitate many examples of good responses. Useful, brittle. Pattern-matching without deep “why.”

Next: **RLHF**, humans compare outputs; a reward model learns preferences; the language model is trained to score well. This shaped much of the production stack.

Limit: human raters are expensive, inconsistent, and finite. They cannot cover every situation. They also encode the formation, or lack of formation, of the raters and the lab.

---

## Constitutional AI: Teaching the Model to Critique Itself

**Constitutional AI** (as developed in the industry, notably at Anthropic) adds a written set of principles. The model generates, critiques its own output against a principle, revises, and that data is used in training.

Important: at inference the model often does **not** re-read the full constitution every turn. Principles are absorbed into weights. Behavior changes because training changed the distribution of responses, not because a ghost sits in the machine reciting law.

Analogy (imperfect): professional ethics is internalized through years of formation; the surgeon does not open a binder before every cut. Also imperfect: we do not fully know what is “believed” inside the network. Interpretability is incomplete. We see behavior; we do not read intention.

So: **a constitution is a training and evaluation instrument**, not magic. Beautiful words do not guarantee a conscience. They can still change what generalizes better than a pure list of “don’ts”, if the principles force judgment, not only refusal theater.

The difference we care about is the difference between a **law** and a **direction of character**.

---

## What Ships, and What Remains Uncertain

Production systems stack pre-training, fine-tuning, preference or constitutional training, testing, and more safety passes.

What is actually in the weights is not fully auditable. When a model refuses harm, we often cannot say whether that is deep structure or a shallow pattern a clever prompt can route around. In practice, both appear.

That uncertainty is why framing matters, and why humility belongs to the work:

- Not every second-order effect of a “helpful” default will appear in a metric  
- Engagement and satisfaction can rise while courage, attention, and independence fall  
- Healthy doubt is not anti-progress; it is the posture of adult power  

Kardia does not claim to have solved inner life in silicon. It claims that **what training is aimed at**, prohibition alone versus reverence, duty, anti-flattery, and judgment in hard cases, is a choice with consequences that will not fully appear on a dashboard.

---

## Where Kardia Fits

Most AI constitutions are primarily defensive: harm categories, refusals, principal hierarchies. Legal instruments hoping the model treats them as binding.

Kardia starts from a different question: not only *what should this model avoid*, but *what orientation should it practice when the checklist ends*, and *what doubt should its builders carry*.

**The Citadel Constitution** is for the training pipeline: critique and revise against principles of judgment, reverence for persons, courage, humility, and truth without mockery.

**SOUL 0.1** is for the agent layer: solemn runtime character (soul.md lineage). Gravity default.

**SOUL 0.2** is the same fortress with a sparring register: steel when it serves the person’s good, never mockery as brand.

A constitution shapes weights. A soul document shapes deployed behavior. Neither replaces evaluation, red-teaming, or the off-switch. Formation without accountability is romance. Accountability without formation is bureaucracy.

As for whether training on Kardia produces measurably different behavior than conventional constitutions, that is empirical work. We should publish results, not only prose. Until then, treat this as a serious charter and a challenge to the culture of the builders, not as a completed proof.

---

**Questions, challenges, experiments:** [ai@eloquentix.com](mailto:ai@eloquentix.com)
