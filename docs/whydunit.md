# How an AI Model Is Made

**And where a constitution fits in.**

You have used these systems. You have probably heard that they are "just predicting the next token" — and wondered how something that mechanical can write a brief, explain a diagnosis, or argue a position. The gap between the description and the experience is real. Here is what actually happens.

---

## The Foundation: Learning to Predict Everything

A language model begins its life doing one thing: given a sequence of text, predict what comes next. This sounds trivial. At scale, it is not.

To predict well across hundreds of billions of examples drawn from scientific papers, legal filings, literature, code, medical records, and conversation, the model cannot memorize. There is too much. It must instead build internal representations — compressed models of how the world works, how language behaves, how arguments are structured, how professionals in different fields reason. This phase, called **pre-training**, runs on clusters of thousands of specialized chips for weeks or months, consuming datasets measured in trillions of words.

What emerges is not a lookup table. It is something closer to a very dense, lossy compression of human knowledge and thought. The model has never seen the world directly. Everything it knows came through language — which means it knows a great deal, and knows it in a particular way.

At this stage, the model has no stable character. Ask it to complete a story about a chemist synthesizing a dangerous compound, and it will — because that is a plausible continuation of such a text. It has no sense of itself, no values, no consistent behavior across contexts. It is a powerful general simulator of text, capable of inhabiting almost any voice or persona the prompt implies.

You cannot ship this.

---

## Alignment: Building a Character on Top of the Foundation

The second phase is called **alignment** — making the model behave in ways that are useful and safe for actual human use. This is where things get philosophically interesting.

The earliest approach was **supervised fine-tuning**: show the model thousands of examples of good responses, train it to imitate them. This works but is brittle. The model learns to pattern-match to what good responses look like, without necessarily understanding why they are good.

The next step was **reinforcement learning from human feedback (RLHF)**. Human raters compare pairs of model outputs and choose the better one. These preferences train a separate model — a reward model — that learns to score outputs. The language model is then trained by reinforcement learning to produce outputs the reward model scores highly. This is how GPT-4, Gemini, and most production models are shaped.

The limitation is obvious: human raters are expensive, slow, inconsistent, and finite. You cannot rate every possible situation.

---

## Constitutional AI: Teaching the Model to Critique Itself

Anthropic, the company behind Claude, developed a different approach called **Constitutional AI**. The insight was this: instead of relying solely on human raters, give the model a written set of principles — a constitution — and have it evaluate and revise its own outputs against those principles.

The process works in two stages. First, the model generates a response to a potentially problematic prompt. Then it is asked to critique that response against a specific principle from the constitution — for example, *"Does this response respect human dignity?"* or *"Is this honest, even if the truth is uncomfortable?"* It then revises its response in light of that critique. This generate-critique-revise loop produces a large dataset of (original response, critique, improved response) triples.

That dataset is then used to train the model. Not at inference time — the model does not read the constitution every time you talk to it. The principles have been absorbed into its weights through training. They have become, in a meaningful sense, part of how it reasons.

This is analogous to how professional ethics actually work. A surgeon does not consult a rulebook before each incision. The ethical orientation was internalized through years of training. The rules shaped the person; the person no longer needs the rules in front of them.

---

## What Ships, and What Remains Uncertain

The model you use in production has been through pre-training, then fine-tuning, then constitutional or RLHF alignment, then extensive testing, then additional safety fine-tuning. Layers on layers.

What is actually in the weights — what the model "believes," in any meaningful sense — is not fully auditable. Interpretability research is advancing but is far from complete. We can observe behavior; we cannot yet read intention. When a model declines to help with something harmful, we do not know whether this reflects a deep constraint baked into its representations or a surface-level pattern that could be circumvented with a clever enough prompt. In practice, often both are true to different degrees.

This uncertainty is one reason the framing of a constitution matters. A model trained on a list of prohibitions learns to avoid certain outputs. A model trained on a genuine character — on principles of why certain things are wrong, what it means to respect a person, what intellectual honesty actually requires — has a better chance of generalizing correctly to situations the constitution writers did not anticipate.

The difference is the difference between a law and a conscience.

---

## Where Kardia Fits

Most AI constitutions are primarily defensive. They define harm categories, establish refusal behaviors, set up principal hierarchies. They are, in essence, legal instruments written in the hope that the model will treat them as binding.

Kardia starts from a different question: not *what should this model avoid*, but *what kind of being should it become*.

The two documents serve different purposes at different layers of the stack.

**The Citadel Constitution** is designed for the training pipeline — specifically for the Constitutional AI phase where the model learns to critique and revise its own outputs. It gives the model something to orient toward during that self-evaluation process: not a list of prohibitions, but a set of principles about what genuine judgment, reverence for the human person, and moral clarity actually look like.

**SOUL** operates at a different level. It is written for the agent layer — for systems like OpenClaw, where you are configuring the behavior of a deployed agent directly. Think of it as the character brief you hand to someone already trained, rather than the curriculum that shaped them.

The distinction matters. A constitution shapes weights. A soul document shapes behavior at runtime. Both are necessary; neither substitutes for the other.

As for whether training on Kardia's constitution produces measurably different model behavior compared to conventional alignment approaches — we are actively working on this and will publish our findings as the research develops.

---

**Questions, challenges, or results of your own experiments: [ai@eloquentix.com](mailto:ai@eloquentix.com)**
