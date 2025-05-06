---
layout: post
title:  "Naturalistic Music Decoding from EEG Data via Latent Diffusion Models"
date:   2024-05-16 21:32:00 +0700
categories: paper
usemathjax: true
---

## *ICASSP 2025 Conference Paper*

- <a href="https://arxiv.org/abs/2405.09062v6">arXiv</a>
- <a href="https://ieeexplore.ieee.org/document/10887735">IEEE Xplore</a>

## Abstract

In this article, we explore the potential of using latent diffusion models, a family of powerful generative models, for the task of reconstructing naturalistic music from electroencephalogram (EEG) recordings. Unlike simpler music with limited timbres, such as MIDI-generated tunes or monophonic pieces, the focus here is on intricate music featuring a diverse array of instruments, voices, and effects, rich in harmonics and timbre. This study represents an initial foray into achieving general music reconstruction of high-quality using non-invasive EEG data, employing an end-to-end training approach directly on raw data without the need for manual pre-processing and channel selection. We train our models on the public NMED-T dataset and perform quantitative evaluation proposing neural embedding-based metrics. We additionally perform song classification based on the generated tracks. Our work contributes to the ongoing research in neural decoding and brain-computer interfaces, offering insights into the feasibility of using EEG data for complex auditory information reconstruction.

## Decoding examples - ControlNet Subject 2

#### Track 23 - Test chunk

**GT** 
<audio src="/assets/audio/brainwave/controlnet-2/1/gt.wav" controls>
Your browser does not support the audio element.
</audio> 

**EEG Decoded** 
<audio src="/assets/audio/brainwave/controlnet-2/1/gen.wav" controls>
Your browser does not support the audio element.
</audio> 

#### Track 26 - Test chunk

**GT** 
<audio src="/assets/audio/brainwave/controlnet-2/25/gt.wav" controls>
Your browser does not support the audio element.
</audio> 

**EEG Decoded** 
<audio src="/assets/audio/brainwave/controlnet-2/25/gen.wav" controls>
Your browser does not support the audio element.
</audio> 

#### Track 27 - Test chunk

**GT** 
<audio src="/assets/audio/brainwave/controlnet-2/32/gt.wav" controls>
Your browser does not support the audio element.
</audio> 

**EEG Decoded** 
<audio src="/assets/audio/brainwave/controlnet-2/32/gen.wav" controls>
Your browser does not support the audio element.
</audio>

#### Track 28 - Test chunk

**GT** 
<audio src="/assets/audio/brainwave/controlnet-2/39/gt.wav" controls>
Your browser does not support the audio element.
</audio> 

**EEG Decoded** 
<audio src="/assets/audio/brainwave/controlnet-2/39/gen.wav" controls>
Your browser does not support the audio element.
</audio>


## Decoding examples - ConvNet Subject 2

#### Track 23 - Test chunk

**GT** 
<audio src="/assets/audio/brainwave/conv-2/0/gt.wav" controls>
Your browser does not support the audio element.
</audio> 

**EEG Decoded** 
<audio src="/assets/audio/brainwave/conv-2/0/gen.wav" controls>
Your browser does not support the audio element.
</audio> 

#### Track 26 - Test chunk

**GT** 
<audio src="/assets/audio/brainwave/conv-2/24/gt.wav" controls>
Your browser does not support the audio element.
</audio> 

**EEG Decoded** 
<audio src="/assets/audio/brainwave/conv-2/24/gen.wav" controls>
Your browser does not support the audio element.
</audio> 

