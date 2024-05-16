---
layout: post
title:  "Naturalistic Music Decoding from EEG Data via Latent Diffusion Models"
date:   2024-05-16 21:32:00 +0700
categories: paper
usemathjax: true
---


# Naturalistic Music Decoding from EEG Data via Latent Diffusion Models

## Abstract

In this article, we explore the potential of using latent diffusion models, a family of powerful generative models, for the task of reconstructing naturalistic music from electroencephalogram (EEG) recordings. Unlike simpler music with limited timbres, such as MIDI-generated tunes or monophonic pieces, the focus here is on intricate music featuring a diverse array of instruments, voices, and effects, rich in harmonics and timbre. This study represents an initial foray into achieving general music reconstruction of high-quality using non-invasive EEG data, employing an end-to-end training approach directly on raw data without the need for manual pre-processing and channel selection. We train our models on the public NMED-T dataset and perform quantitative evaluation proposing neural embedding-based metrics. We additionally perform song classification based on the generated tracks. Our work contributes to the ongoing research in neural decoding and brain-computer interfaces, offering insights into the feasibility of using EEG data for complex auditory information reconstruction.

## Decoding examples


#### Track 23 - Test chunk

GT: <audio src="/assets/audio/brainwave/1/gt.wav" controls>
Your browser does not support the audio element.
</audio> 

Generated from EEG: 

<audio src="/assets/audio/brainwave/1/gen.wav" controls>
Your browser does not support the audio element.
</audio> 

#### Track 26 - Test chunk

#### Track 27 - Test chunk

#### Track 22 - Test chunk



