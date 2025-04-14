# Gemini 2.0 Flash Multimodal Live API Client

A lightweight vanilla JavaScript implementation of the Gemini 2.0 Flash Multimodal Live API client. This project provides real-time interaction with Gemini's API through text, audio, video, and screen sharing capabilities.

This is a simplified version of [Google's original React implementation](https://github.com/google-gemini/multimodal-live-api-web-console), created in response to [this issue](https://github.com/google-gemini/multimodal-live-api-web-console/issues/19).

## Live Demo on GitHub Pages

[Live Demo](https://viaanthroposbenevolentia.github.io/gemini-2-live-api-demo/)

## Key Features

- Real-time chat with Gemini 2.0 Flash Multimodal Live API
- Real-time audio responses from the model
- Real-time audio input from the user, allowing interruptions
- Real-time video streaming from the user's webcam
- Real-time screen sharing from the user's screen
- Function calling
- Transcription of the model's audio (if Deepgram API key provided)
- Built with vanilla JavaScript (no dependencies)
- Mobile-friendly

## Prerequisites

- Modern web browser with WebRTC, WebSocket, and Web Audio API support
- Google AI Studio API key
- `python -m http.server` or `npx http-server` or Live Server extension for VS Code (to host a server for index.html)

## Quick Start

1. Get your API key from Google AI Studio
2. Clone the repository

   ```bash
   git clone https://github.com/ViaAnthroposBenevolentia/gemini-2-live-api-demo.git
   ```

3. Start the development server (adjust port if needed):

   ```bash
   cd gemini-2-live-api-demo
   python -m http.server 8000 # or npx http-server 8000 or Open with Live Server extension for VS Code
   ```

4. Access the application at `http://localhost:8000`

5. Open the settings at the top right, paste your API key, and click "Save"
6. Get free API key from [Deepgram](https://deepgram.com/pricing) and paste in the settings to get real-time transcript (Optional).

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License.


### example 

```js
// ...existing code...

// 替换现有的mic按钮点击事件
elements.micBtn.removeEventListener('click', /* 现有的处理函数 */);

// 添加按下事件 - 开始录音
elements.micBtn.addEventListener('mousedown', async () => {
    await ensureAgentReady(agent);
    
    // 开始录音
    await agent.startRecording();
    elements.micBtn.classList.add('active');
    
    console.info('Recording started - mouse button pressed');
});

// 添加松开事件 - 停止录音并发送
elements.micBtn.addEventListener('mouseup', async () => {
    if (!agent.audioRecorder.isRecording) return;
    
    // 获取录制的音频数据并停止录音
    const audioData = await agent.stopAndGetRecording();
    
    // 发送到服务器
    await agent.client.sendAudio(audioData);
    
    elements.micBtn.classList.remove('active');
    console.info('Recording stopped and sent - mouse button released');
});

// 添加鼠标移出按钮时也停止录音
elements.micBtn.addEventListener('mouseleave', async () => {
    if (!agent.audioRecorder.isRecording) return;
    
    // 获取录制的音频数据并停止录音
    const audioData = await agent.stopAndGetRecording();
    
    // 发送到服务器
    await agent.client.sendAudio(audioData);
    
    elements.micBtn.classList.remove('active');
    console.info('Recording stopped and sent - mouse left button');
});
```

客户端播放pcm格式：

```
// 在 client.js 中
if (serverContent.modelTurn) {
    // 提取音频部分
    const audioParts = parts.filter((p) => p.inlineData && p.inlineData.mimeType.startsWith('audio/pcm'));
    const base64s = audioParts.map((p) => p.inlineData?.data);
    
    // 处理每个音频块
    base64s.forEach((b64) => {
        if (b64) {
            const data = base64ToArrayBuffer(b64);
            this.emit('audio', data);  // 发出音频事件
        }
    });
}

// 在 agent.js 中
this.client.on('audio', async (data) => {
    if (!this.audioStreamer.isInitialized) {
        this.audioStreamer.initialize();
    }
    this.audioStreamer.streamAudio(new Uint8Array(data));
});


// 在 streamAudio 方法中
// 将 Int16 PCM 数据转换为 Web Audio API 使用的 Float32 格式
const float32Array = new Float32Array(chunk.length / 2);
const dataView = new DataView(chunk.buffer);

for (let i = 0; i < chunk.length / 2; i++) {
    const int16 = dataView.getInt16(i * 2, true);
    float32Array[i] = int16 / 32768;  // 缩放到 [-1.0, 1.0] 范围
}


// 累积数据到处理缓冲区
const newBuffer = new Float32Array(this.processingBuffer.length + float32Array.length);
newBuffer.set(this.processingBuffer);
newBuffer.set(float32Array, this.processingBuffer.length);
this.processingBuffer = newBuffer;

// 将处理缓冲区分割为固定大小的播放块
while (this.processingBuffer.length >= this.bufferSize) {
    const buffer = this.processingBuffer.slice(0, this.bufferSize);
    this.audioQueue.push(buffer);
    this.processingBuffer = this.processingBuffer.slice(this.bufferSize);
}

// 在 scheduleNextBuffer 方法中
const audioData = this.audioQueue.shift();
const audioBuffer = this.createAudioBuffer(audioData);
const source = this.context.createBufferSource();

source.buffer = audioBuffer;
source.connect(this.gainNode);

// 确保精确的播放时序
const startTime = Math.max(this.scheduledTime, this.context.currentTime);
source.start(startTime);
this.scheduledTime = startTime + audioBuffer.duration;

```


###pcm player
https://github.com/pkjy/pcm-player