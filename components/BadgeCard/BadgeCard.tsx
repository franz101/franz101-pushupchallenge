import "@tensorflow/tfjs-backend-webgl";
import ConfettiExplosion from "react-confetti-explosion";

import { IconHeart } from "@tabler/icons-react";
import {
  Card,
  Image,
  Text,
  Group,
  Badge,
  Button,
  ActionIcon,
  Center,
  Grid,
  Dialog,
  TextInput,
} from "@mantine/core";
import { useCounter, useDebouncedState, useInputState } from "@mantine/hooks";

import classes from "./BadgeCard.module.css";
import Webcam from "react-webcam";
import { Camera } from "@mediapipe/camera_utils";
import * as Model from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
// Register WebGL backend.
import * as tfBackend from "@tensorflow/tfjs-backend-webgl";
import { use, useEffect, useRef, useState } from "react";
const WIDTH = 640;
const HEIGHT = 480;
const mockdata = {
  image:
    "https://images.unsplash.com/photo-1437719417032-8595fd9e9dc6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80",
  title: "Verudela Beach",
  country: "Croatia",
  description:
    "Completely renovated for the season 2020, Arena Verudela Bech Apartments are fully equipped and modernly furnished 4-star self-service apartments located on the Adriatic coastline by one of the most beautiful beaches in Pula.",
  badges: [
    { emoji: "☀️", label: "Fitness" },
    { emoji: "🦓", label: "Wellbeing" },
    { emoji: "🌊", label: "Friendship" },
    { emoji: "🌲", label: "Nature" },
    { emoji: "🤽", label: "Sports" },
  ],
};

const distanceBetweenPoints = (a: any, b: any) => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};

export function BadgeCard() {
  const [stringValue, setStringValue] = useInputState("");

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [pushup, setPushup] = useState(false);

  const audioRef = useRef<any>(null);
  const [count, handlers] = useCounter(0, { min: 0, max: 10 });
  let timeoutId: NodeJS.Timeout; // You can use any other type according to your setup
  useEffect(() => {
    if (pushup) {
      timeoutId = setTimeout(() => {
        handlers.increment();
      }, 1000);
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [pushup]);

  useEffect(() => {
    if (shouldPlay && audioRef.current) {
      audioRef?.current?.play();
    }
  }, [shouldPlay]);
  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      console.log("Tensorflow is ready.");
      const detectorConfig = {
        runtime: "tfjs",
        modelType: Model.movenet.modelType.SINGLEPOSE_THUNDER,
      };
      const detector = await Model.createDetector(
        Model.SupportedModels.MoveNet,
        detectorConfig
      );
      const camera = new Camera(webcamRef?.current?.video!, {
        onFrame: async () => {
          const poses = await detector.estimatePoses(
            webcamRef?.current?.video!
          );
          drawCanvas(canvasRef.current!.getContext("2d")!, {
            image: webcamRef.current!.video!,
            poses,
          });
        },
        width: WIDTH,
        height: HEIGHT,
      });
      camera.start();
      setCameraStarted(true);
    };

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      !cameraStarted
    ) {
      loadModel();
    }
  }, [cameraStarted]);

  const drawCanvas = (ctx: CanvasRenderingContext2D, results: any) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    const pose = results?.poses?.[0]?.keypoints[0];

    ctx.save();
    ctx.clearRect(0, 0, width, height);
    // canvas horizontal flip
    ctx.scale(-1, 1);
    ctx.translate(-width, 0);

    // Drawing captured image
    ctx.drawImage(results.image, 0, 0, width, height);
    if (pose && pose?.name === "nose" && pose?.score > 0.15) {
      const keypoints = results?.poses?.[0]?.keypoints;
      const leftEye = keypoints?.find((item: any) => item.name === "left_eye");

      const x = pose.x;
      const y = pose.y;
      let color = "#FF0000"; // Red color

      if (y > HEIGHT * 0.75) {
        setShouldPlay(true);
        setPushup(true);
        color = "#00FF00"; // Green color
        // Draw a green line at HEIGHT * 0.75
        ctx.beginPath();
        ctx.moveTo(0, HEIGHT * 0.75);
        ctx.lineTo(WIDTH, HEIGHT * 0.75);
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.stroke();
      } else {
        setShouldPlay(false);
        setPushup(false);
        // Draw a red line at HEIGHT * 0.75
        ctx.beginPath();
        ctx.moveTo(0, HEIGHT * 0.75);
        ctx.lineTo(WIDTH, HEIGHT * 0.75);
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.stroke();
      }

      const radius = 5; // Change this value to adjust the circle's size

      // Draw a circle on the nose's position
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.stroke();
    }

    ctx.restore();
  };

  const { image, title, description, country, badges } = mockdata;
  const features = badges.map((badge) => (
    <Badge variant="light" key={badge.label} leftSection={badge.emoji}>
      {badge.label}
    </Badge>
  ));

  return (
    <Card withBorder radius="md" p="md" className={classes.card}>
      <Card.Section className={classes.webcamSection}>
        <Grid>
          <Grid.Col span={2}>
            <Text fz="50" fw={500}>
              {count}/10
            </Text>
          </Grid.Col>
          <Grid.Col span={8}>
            <canvas
              ref={canvasRef}
              style={{ borderRadius: 10 }}
              width={WIDTH}
              height={HEIGHT}
            />
            <Center>
              <div>
                {" "}
                {count === 10 && (
                  <ConfettiExplosion
                    {...{
                      force: 0.8,
                      duration: 3000,
                      particleCount: 250,
                      width: 1600,
                    }}
                  />
                )}
                <Dialog
                  opened={count === 10}
                  withCloseButton
                  position={{ top: "25%", left: "25%" }}
                  // onClose={close}
                  size="lg"
                  radius="md"
                >
                  <Text size="sm" mb="xs" fw={500}>
                    Congratulations you did it! Challenge a friend.
                  </Text>

                  <Group align="flex-end">
                    <TextInput
                      placeholder="hello@gluesticker.com"
                      value={stringValue}
                      onChange={setStringValue}
                      style={{ flex: 1 }}
                    />
                    <Button
                      onClick={() => {
                        window.open(
                          `mailto:${stringValue}?subject=Pushup challenge&body=I challenge you to do 10 pushups in a row. Let me know if you can do it.`,
                          "_blank"
                        );
                      }}
                    >
                      Subscribe
                    </Button>
                  </Group>
                </Dialog>
              </div>
            </Center>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text fz="lg" fw={500}>
              {pushup ? "Hold it..." : "Do a pushup"}
            </Text>
          </Grid.Col>
        </Grid>
      </Card.Section>

      <Card.Section className={classes.section} mt="md">
        <Group justify="apart">
          <Text fz="lg" fw={500}>
            Push up challenge
          </Text>
          <Badge size="sm" variant="light">
            Beginner
          </Badge>
        </Group>
        <Text fz="sm" mt="xs">
          Challenge a friend to do 10 push ups in a row and see who can do more.
          You can also challenge yourself and try to beat your own record.
        </Text>
      </Card.Section>

      <Card.Section className={classes.section}>
        <Text mt="md" className={classes.label} c="dimmed">
          Perfect for you, if you enjoy
        </Text>
        <Group gap={7} mt={5}>
          {features}
        </Group>
      </Card.Section>

      <Group mt="xs">
        {/* <Button radius="md" style={{ flex: 1 }} onClick={capture}>
          Capture Photo
        </Button> */}

        <ActionIcon variant="default" radius="md" size={36}>
          <IconHeart className={classes.like} stroke={1.5} />
        </ActionIcon>
      </Group>
      <Group mt="xs">
        <Webcam
          style={{ visibility: "hidden" }}
          ref={webcamRef}
          mirrored={true}
          height={WIDTH}
          width={HEIGHT}
          videoConstraints={{
            facingMode: "user",
          }}
        />
        <audio ref={audioRef}>
          <source
            src={
              "http://www.mrugala.net/Divers/Musiques%20MIDI/Sound%20-%20Cloche%20(2s).wav"
            }
            type="audio/wav"
          />
          Your browser does not support the audio element.
        </audio>
      </Group>
    </Card>
  );
}
