/*
 * The copyright in this software is being made available under the BSD License, included below. This software may be subject to other third party and contributor rights, including patent rights, and no such rights are granted under this license.
 * 
 * Copyright (c) 2013, Digital Primates
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * •  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * •  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * •  Neither the name of the Digital Primates nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
MediaPlayer.rules.BufferBasedRule = function () {
    "use strict";

    var bufferLevel,
		qulity,
		qulityPlus,
		qulityMinus,
		newQuality,
		bufferLevelValue,
		reservoir = 5,
		cushion = 2;

    return {
        debug: undefined,
		manifestExt: undefined,
		metricsExt: undefined,
		
		checkIndex: function (current, metrics, data) {
			var self = this,
			playlist,
			trace,
			shift = false,
			lastRequest = self.metricsExt.getCurrentHttpRequest(metrics),
			bufferLevel,
			bufferMax = 30,
			bufferLevelValue,
			qulity,
			qulityPlus,
			qulityMinus,
			newQuality,
			reservoir = 5,
			cushion = 10,
			tmp,
			len,
			max,
			deffered,
			p = MediaPlayer.rules.SwitchRequest.prototype.DEFAULT;
			//p = MediaPlayer.rules.SwitchRequest.prototype.STRONG;
			if (!metrics) {
				return Q.when(new MediaPlayer.rules.SwitchRequest());
			}
			if (lastRequest === null) {
				return Q.when(new MediaPlayer.rules.SwitchRequest());
			}
			if (lastRequest.mediaduration === null ||
					lastRequest.mediaduration === undefined ||
					lastRequest.mediaduration <= 0 ||
					isNaN(lastRequest.mediaduration)) 
			{
				return Q.when(new MediaPlayer.rules.SwitchRequest());
			}

			deffered = Q.defer();
			qulity = current;
			bufferLevelValue = self.metricsExt.getCurrentBufferLevel(metrics);
			if (bufferLevelValue !== null) {
				bufferLevel = bufferLevelValue.level;
			}
			if (isNaN(bufferLevel) || bufferLevel === undefined) {
				bufferLevel = 0;
			}

						//return Q.when(new MediaPlayer.rules.SwitchRequest(2, p));
			len = data.Representation_asArray.length;
			self.debug.log("BBR:" + len);
			max = len;
			if (qulity < 0) {
				qulity = 0;
			}
			if (qulity >= max) {
				qulity = max - 1;
			}

			if (qulity == max -1) {
				qulityPlus = max - 1;
			} else {
				qulityPlus = qulity + 1;
			}

			if (qulity == 0) {
				qulityMinus = 0;
			} else {
				qulityMinus = qulity - 1;
			}

			tmp = (bufferLevel - reservoir) * (max - 1) / cushion;
			if (bufferLevel <= reservoir) {
				newQuality = 0;
			} else if (tmp >= qulityPlus) {
				newQuality = Math.floor(tmp);
			} else if (tmp <= qulityMinus) {
				newQuality = Math.ceil(tmp);
			} else {
				newQuality = qulity;
			}
			deffered.resolve(new MediaPlayer.rules.SwitchRequest(newQuality, p));
			//return Q.when(new MediaPlayer.rules.SwitchRequest(newQuality, p));
			
			
			return deffered.promise;
		}
	};
};

MediaPlayer.rules.BufferBasedRule.prototype = {
	constructor: MediaPlayer.rules.BufferBasedRule
};
