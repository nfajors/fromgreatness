// Assessment question data

export interface PersonalityQuestion {
  id: number;
  text: string;
  trait: 'visual' | 'auditory' | 'kinesthetic' | 'creative' | 'analytical' | 'social' | 'leadership' | 'detail';
}

export const personalityQuestions: PersonalityQuestion[] = [
  { id: 1, text: "When learning something new, I prefer to watch a video about it first.", trait: "visual" },
  { id: 2, text: "I enjoy hands-on activities and learning by doing.", trait: "kinesthetic" },
  { id: 3, text: "I like to read instructions carefully before starting.", trait: "analytical" },
  { id: 4, text: "I work well in groups and enjoy collaborating with others.", trait: "social" },
  { id: 5, text: "I often come up with new and creative ideas.", trait: "creative" },
  { id: 6, text: "I prefer listening to explanations rather than reading.", trait: "auditory" },
  { id: 7, text: "I pay close attention to details and like things to be organized.", trait: "detail" },
  { id: 8, text: "I enjoy taking charge and leading group activities.", trait: "leadership" },
  { id: 9, text: "I remember things better when I see pictures or diagrams.", trait: "visual" },
  { id: 10, text: "I like to experiment and try different approaches.", trait: "kinesthetic" },
  { id: 11, text: "I enjoy solving puzzles and logic problems.", trait: "analytical" },
  { id: 12, text: "I make friends easily and enjoy meeting new people.", trait: "social" },
  { id: 13, text: "I enjoy drawing, painting, or other artistic activities.", trait: "creative" },
  { id: 14, text: "I remember things people tell me very well.", trait: "auditory" },
  { id: 15, text: "I like to follow step-by-step instructions carefully.", trait: "detail" },
  { id: 16, text: "Others often look to me for direction and decisions.", trait: "leadership" },
  { id: 17, text: "I prefer visual presentations over written reports.", trait: "visual" },
  { id: 18, text: "I learn best through practice and repetition.", trait: "kinesthetic" },
  { id: 19, text: "I enjoy analyzing data and finding patterns.", trait: "analytical" },
  { id: 20, text: "I value teamwork and group discussion.", trait: "social" },
  { id: 21, text: "I often think outside the box to solve problems.", trait: "creative" },
  { id: 22, text: "I enjoy podcasts, audiobooks, and verbal storytelling.", trait: "auditory" },
  { id: 23, text: "I notice small details that others might miss.", trait: "detail" },
  { id: 24, text: "I feel confident organizing and directing projects.", trait: "leadership" },
  { id: 25, text: "I use color-coding and visual aids to organize my notes.", trait: "visual" },
  { id: 26, text: "I prefer to learn by building or creating something tangible.", trait: "kinesthetic" },
  { id: 27, text: "I like breaking complex problems into smaller parts.", trait: "analytical" },
  { id: 28, text: "I enjoy helping others learn and understand new things.", trait: "social" },
  { id: 29, text: "I enjoy writing stories, poems, or music.", trait: "creative" },
  { id: 30, text: "I prefer verbal instructions over written ones.", trait: "auditory" },
];

export interface AchievementQuestion {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  domain: 'History' | 'Language' | 'Food' | 'Dress';
  difficulty: 'easy' | 'medium' | 'hard';
}

export const achievementQuestions: AchievementQuestion[] = [
  { id: 1, text: "Which of these is a traditional West African textile pattern?", options: ["Paisley", "Kente", "Tartan", "Ikat"], correctIndex: 1, domain: "Dress", difficulty: "easy" },
  { id: 2, text: "What is the primary language family spoken across much of West Africa?", options: ["Bantu", "Niger-Congo", "Afro-Asiatic", "Khoisan"], correctIndex: 1, domain: "Language", difficulty: "easy" },
  { id: 3, text: "Which grain is a staple food in many West African countries?", options: ["Rice", "Millet", "Teff", "Sorghum"], correctIndex: 1, domain: "Food", difficulty: "easy" },
  { id: 4, text: "The Mali Empire was known for its wealth in which resource?", options: ["Diamonds", "Gold", "Oil", "Spices"], correctIndex: 1, domain: "History", difficulty: "easy" },
  { id: 5, text: "Which traditional garment is commonly worn across West Africa?", options: ["Kimono", "Dashiki", "Sari", "Kaftan"], correctIndex: 1, domain: "Dress", difficulty: "easy" },
  { id: 6, text: "What does the Adinkra symbol 'Gye Nyame' represent?", options: ["Unity", "Strength", "Supremacy of God", "Wisdom"], correctIndex: 2, domain: "History", difficulty: "medium" },
  { id: 7, text: "Which language is widely spoken as a lingua franca across West Africa?", options: ["Zulu", "Hausa", "Swahili", "Amharic"], correctIndex: 1, domain: "Language", difficulty: "medium" },
  { id: 8, text: "Jollof rice originated from which region?", options: ["East Africa", "West Africa", "North Africa", "Central Africa"], correctIndex: 1, domain: "Food", difficulty: "easy" },
  { id: 9, text: "The ancient city of Timbuktu is located in present-day...", options: ["Ghana", "Mali", "Nigeria", "Senegal"], correctIndex: 1, domain: "History", difficulty: "medium" },
  { id: 10, text: "Kente cloth is traditionally woven by which ethnic group?", options: ["Yoruba", "Akan", "Igbo", "Mandinka"], correctIndex: 1, domain: "Dress", difficulty: "medium" },
  { id: 11, text: "Which writing system was developed in ancient Nubia?", options: ["Arabic script", "Meroitic", "Ge'ez", "Nsibidi"], correctIndex: 1, domain: "Language", difficulty: "hard" },
  { id: 12, text: "Fufu is a staple food made from what ingredient(s)?", options: ["Rice and beans", "Pounded cassava and plantains", "Cornmeal", "Wheat flour"], correctIndex: 1, domain: "Food", difficulty: "easy" },
  { id: 13, text: "Mansa Musa was the ruler of which empire?", options: ["Ghana Empire", "Mali Empire", "Songhai Empire", "Benin Empire"], correctIndex: 1, domain: "History", difficulty: "easy" },
  { id: 14, text: "What is Bogolanfini, also known as mud cloth, traditionally made from?", options: ["Cotton dyed with fermented mud", "Silk threads", "Wool fibers", "Palm leaves"], correctIndex: 0, domain: "Dress", difficulty: "hard" },
  { id: 15, text: "Which African language uses the Ge'ez script?", options: ["Amharic", "Hausa", "Swahili", "Zulu"], correctIndex: 0, domain: "Language", difficulty: "medium" },
  { id: 16, text: "Injioloti is a traditional dish from which region?", options: ["West Africa", "East Africa", "North Africa", "Southern Africa"], correctIndex: 3, domain: "Food", difficulty: "hard" },
  { id: 17, text: "The Nok civilization is known for which artifacts?", options: ["Terracotta sculptures", "Gold jewelry", "Stone pyramids", "Bronze masks"], correctIndex: 0, domain: "History", difficulty: "hard" },
  { id: 18, text: "Which fabric is known as 'African wax print'?", options: ["Kitenge", "Batik", "Shweshwe", "Adire"], correctIndex: 0, domain: "Dress", difficulty: "medium" },
  { id: 19, text: "The Swahili language primarily blends which linguistic influences?", options: ["Bantu and Arabic", "English and French", "Portuguese and Dutch", "Hausa and Yoruba"], correctIndex: 0, domain: "Language", difficulty: "medium" },
  { id: 20, text: "Which spice is commonly used in Ethiopian cuisine?", options: ["Berbere", "Garam masala", "Cajun seasoning", "Five-spice"], correctIndex: 0, domain: "Food", difficulty: "medium" },
  { id: 21, text: "The Great Zimbabwe ruins were built by which civilization?", options: ["Shona people", "Zulu people", "Xhosa people", "Ndebele people"], correctIndex: 0, domain: "History", difficulty: "medium" },
  { id: 22, text: "The Maasai people are known for which distinctive clothing feature?", options: ["Shuka cloth", "Bark cloth", "Animal skins", "Woven baskets"], correctIndex: 0, domain: "Dress", difficulty: "medium" },
  { id: 23, text: "Which tonal language is spoken by over 20 million people in West Africa?", options: ["Yoruba", "Somali", "Kinyarwanda", "Wolof"], correctIndex: 0, domain: "Language", difficulty: "hard" },
  { id: 24, text: "Injera is a type of flatbread from which region?", options: ["Ethiopia and Eritrea", "Morocco", "Nigeria", "Kenya"], correctIndex: 0, domain: "Food", difficulty: "medium" },
  { id: 25, text: "The Kingdom of Benin is famous for which art form?", options: ["Bronze sculptures", "Pottery", "Tapestry", "Wood carving"], correctIndex: 0, domain: "History", difficulty: "medium" },
];

export interface CulturalQuestion {
  id: number;
  type: 'multiple' | 'rating' | 'multiselect' | 'text';
  text: string;
  options?: string[];
  maxLength?: number;
}

export const culturalQuestions: CulturalQuestion[] = [
  { id: 1, type: "multiple", text: "How often does your family cook traditional foods?", options: ["Daily", "Weekly", "Monthly", "Rarely", "Never"] },
  { id: 2, type: "rating", text: "How connected do you feel to your ancestral culture?", options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] },
  { id: 3, type: "multiselect", text: "Which cultural celebrations does your family observe?", options: ["Kwanzaa", "Juneteenth", "Family reunions", "Traditional harvest festivals", "Heritage months", "Religious holidays", "None of the above"] },
  { id: 4, type: "text", text: "Tell us about a family tradition you love:", maxLength: 500 },
  { id: 5, type: "multiple", text: "Do you know which countries or regions your ancestors came from?", options: ["Yes, exactly", "Somewhat", "Not really", "Not at all"] },
  { id: 6, type: "rating", text: "How important is it for you to learn about your heritage?", options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] },
  { id: 7, type: "multiselect", text: "What aspects of culture interest you most?", options: ["History and stories", "Languages", "Food and cooking", "Clothing and fashion", "Music and arts", "Values and traditions"] },
  { id: 8, type: "text", text: "What does your cultural heritage mean to you?", maxLength: 500 },
  { id: 9, type: "multiple", text: "Has anyone in your family taken a DNA test?", options: ["Yes, several people", "Yes, one person", "No, but we're interested", "No, not interested"] },
  { id: 10, type: "rating", text: "How often do you talk about family history with relatives?", options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] },
  { id: 11, type: "multiselect", text: "Which traditional foods have you tried?", options: ["Jollof rice", "Collard greens", "Black-eyed peas", "Sweet potato pie", "Fufu", "Injera", "Gumbo", "None of the above"] },
  { id: 12, type: "text", text: "Describe a memorable experience related to your culture:", maxLength: 500 },
  { id: 13, type: "multiple", text: "Do you speak or understand any languages other than English?", options: ["Yes, fluently", "Yes, somewhat", "A few words", "No"] },
  { id: 14, type: "rating", text: "How much do you know about African history?", options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] },
  { id: 15, type: "multiselect", text: "Which African cultures would you like to learn more about?", options: ["West African", "East African", "Central African", "Southern African", "North African", "Caribbean", "African American"] },
  { id: 16, type: "text", text: "What questions do you have about your heritage?", maxLength: 500 },
  { id: 17, type: "multiple", text: "How do you prefer to learn about culture?", options: ["Reading books", "Watching videos", "Hands-on activities", "Talking with family", "Visiting museums", "Online courses"] },
  { id: 18, type: "rating", text: "How proud do you feel of your cultural background?", options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] },
  { id: 19, type: "multiselect", text: "Have you visited any places significant to your heritage?", options: ["Ancestral country/region", "Cultural museum", "Historical site", "Family hometown", "None yet"] },
  { id: 20, type: "text", text: "Is there anything else you'd like to share about your cultural identity?", maxLength: 500 },
];

export const videoPrompts = [
  "Talk about a family tradition that means a lot to you",
  "Share a recipe your family loves and why it's special",
  "Tell us about a holiday your family celebrates",
  "Describe a story about your ancestors that you've heard",
  "What makes you proud of your cultural background?",
];

// Trait mapping for personality results
export const traitLabels: Record<string, string> = {
  visual: "Visual Learner",
  auditory: "Auditory Learner",
  kinesthetic: "Hands-On Learner",
  creative: "Creative Thinker",
  analytical: "Analytical Thinker",
  social: "Collaborative",
  leadership: "Natural Leader",
  detail: "Detail Oriented",
};

export const traitColors: Record<string, string> = {
  visual: "#00C853",
  auditory: "#38BDF8",
  kinesthetic: "#F59E0B",
  creative: "#7E57C2",
  analytical: "#38BDF8",
  social: "#F8BBD0",
  leadership: "#D4AF37",
  detail: "#00C853",
};
