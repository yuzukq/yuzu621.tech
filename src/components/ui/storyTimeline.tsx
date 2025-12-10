"use client"

import { Timeline, Card, Box } from "@chakra-ui/react";
import { stories } from "@/data/stories";
import { useInView } from "@/hooks/useInView";

function StoryTimelineItem({ story, index }: { story: typeof stories[0]; index: number }) {
  const { ref, isInView } = useInView({ threshold: 0.3 });
  const isEven = index % 2 === 0;

  return (
    <Timeline.Item key={story.id}>
      {isEven ? (
        <>
          <Timeline.Content flex="1" />
          <Timeline.Connector>
            <Timeline.Separator />
            <Timeline.Indicator />
          </Timeline.Connector>
          <Timeline.Content flex="1">
            <Box
              ref={ref}
              opacity={0}
              animation={isInView ? "fade-in 0.8s ease-in-out forwards" : undefined}
            >
              <Timeline.Title color="black">{story.date}</Timeline.Title>
              <Card.Root maxW="sm" overflow="hidden">
                <Card.Body>
                  <Card.Title>{story.title}</Card.Title>
                  <Card.Description whiteSpace="pre-line">{story.description}</Card.Description>
                </Card.Body>
              </Card.Root>
            </Box>
          </Timeline.Content>
        </>
      ) : (
        <>
          <Timeline.Content flex="1" alignItems="flex-end">
            <Box
              ref={ref}
              opacity={0}
              animation={isInView ? "fade-in 0.8s ease-in-out forwards" : undefined}
            >
              <Timeline.Title color="black">{story.date}</Timeline.Title>
              <Card.Root maxW="sm" overflow="hidden">
                <Card.Body>
                  <Card.Title>{story.title}</Card.Title>
                  <Card.Description whiteSpace="pre-line">{story.description}</Card.Description>
                </Card.Body>
              </Card.Root>
            </Box>
          </Timeline.Content>
          <Timeline.Connector>
            <Timeline.Separator />
            <Timeline.Indicator />
          </Timeline.Connector>
          <Timeline.Content flex="1" />
        </>
      )}
    </Timeline.Item>
  );
}

export default function StoryTimeline() {
  return (
    <Timeline.Root size="xl" variant="outline">
      {stories.map((story, index) => (
        <StoryTimelineItem key={story.id} story={story} index={index} />
      ))}
    </Timeline.Root>
  );
}
