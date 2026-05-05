import { SectionContainer } from "@/components/layouts/SectionContainer";
import { Heading, Flex, Box, Image, Text, Button, Link } from "@chakra-ui/react";
import { aboutMe } from "@/data/aboutme";

export default function AboutSection() {
  return (
    <SectionContainer backgroundColor="light" id="about">
      <Flex direction="column" align="center" justify="center" py={20} px={{ base: 4, md: 8 }}>
        <Heading size="2xl" color="black" mb={12}>
          About me
        </Heading>
        
        <Flex 
          direction={{ base: "column", md: "row" }}
          align="center"
          justify="center"
          gap={{ base: 8, md: 12 }}
          maxW="1000px"
          w="100%"
        >
          {/* 左側：アイコン */}
          <Box flexShrink={0}>
            <Image 
              src={aboutMe.icon}
              alt="Profile Icon"
              boxSize={{ base: "250px", md: "300px" }}
              objectFit="cover"
              borderRadius="full"
              border="4px solid"
              borderColor="gray.200"
              shadow="lg"
            />
          </Box>

          {/* 右側：文章 */}
          <Box flex={1}>
            <Text 
              color="gray.800" 
              fontSize={{ base: "lg", md: "xl" }}
              lineHeight="tall"
              whiteSpace="pre-line"
            >
              {aboutMe.description}
            </Text>
          </Box>
        </Flex>

        <Box mt={8}>
          <Link href="/">
            <Button colorPalette="gray" variant="subtle" size="lg">
              ブログを読む
            </Button>
          </Link>
        </Box>
      </Flex>
    </SectionContainer>
  );
}
