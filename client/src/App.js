import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import styled from "styled-components";

const socket = io("http://localhost:3003");

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;

const DisplayBox = styled.div`
  width: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const RoomForm = styled.form``;
const RoomInput = styled.input``;
const RoomButton = styled.button``;

const VideoBox = styled.div``;
const Video = styled.video`
  width: 200px;
  border-radius: 10px;
`;
const VideoButtonBox = styled.div``;
const VideoButton = styled.button``;

function App() {
  const myVideo = useRef(null);
  const otherVideo = useRef(null);

  let myStream;
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  const getMedia = async () => {
    try {
      myStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      myVideo.current.srcObject = myStream;
    } catch (e) {
      console.log(e);
    }
  };
  getMedia();

  function handleMute() {
    myStream
      .getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    if (!muted) {
      setMuted(true);
    } else {
      setMuted(false);
    }
  }
  const handleCamera = () => {
    myStream
      .getVideoTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    if (!cameraOff) {
      setCameraOff(true);
    } else {
      setCameraOff(false);
    }
  };

  useEffect(() => {}, []);
  return (
    <Container>
      <h1>HELLO WORLD</h1>
      <DisplayBox>
        <RoomForm>
          <RoomInput type="text" placeholder="Room Name" />
          <RoomButton>ENTER</RoomButton>
        </RoomForm>
      </DisplayBox>
      <VideoBox>
        <Video ref={myVideo} autoPlay playsInline></Video>
        <VideoButtonBox>
          <VideoButton onClick={handleMute}>
            {muted ? "Mute" : "unMute"}
          </VideoButton>
          <VideoButton onClick={handleCamera}>
            {cameraOff ? "camera On" : "camera Off"}
          </VideoButton>
        </VideoButtonBox>
      </VideoBox>
      <VideoBox>
        <Video ref={otherVideo} autoPlay muted playsInline></Video>
      </VideoBox>
    </Container>
  );
}

export default App;
