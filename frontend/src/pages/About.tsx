import React from 'react';
import { motion } from 'framer-motion';
import { Users, Award, Globe, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';

const About = () => {
  const { t } = useLanguage();

  const stats = [
    { icon: Users, value: '10K+', label: 'Happy Customers', labelTe: 'సంతోషకరమైన కస్టమర్లు' },
    { icon: Award, value: '5000+', label: 'Products', labelTe: 'ఉత్పత్తులు' },
    { icon: Globe, value: '50+', label: 'Cities', labelTe: 'నగరాలు' },
    { icon: Heart, value: '99%', label: 'Satisfaction', labelTe: 'సంతృప్తి' }
  ];

  const values = [
    {
      title: 'Quality First',
      description: 'We never compromise on quality and ensure all products meet the highest standards.',
      titleTe: 'నాణ్యత మొదట',
      descriptionTe: 'మేము నాణ్యతపై ఎప్పుడూ రాజీ పడము మరియు అన్ని ఉత్పత్తులు అత్యున్నత ప్రమాణాలకు అనుగుణంగా ఉండేలా చూస్తాము.'
    },
    {
      title: 'Customer Centric',
      description: 'Our customers are at the heart of everything we do. Their satisfaction is our priority.',
      titleTe: 'కస్టమర్ కేంద్రీకృత',
      descriptionTe: 'మా కస్టమర్లు మనం చేసే ప్రతిదానికీ కేంద్రంలో ఉన్నారు. వారి సంతృప్తి మా ప్రాధాన్యత.'
    },
    {
      title: 'Sustainability',
      description: 'We are committed to sustainable practices and eco-friendly products.',
      titleTe: 'స్థిరత్వం',
      descriptionTe: 'మేము స్థిరమైన పద్ధతులు మరియు పర్యావరణ అనుకూల ఉత్పత్తులకు కట్టుబడి ఉన్నాము.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t('about')} EcoStore
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're passionate about bringing you the best products while making a positive impact on the world. 
            Our journey started with a simple mission: to make quality products accessible to everyone.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {stats.map((stat, index) => (
            <Card key={index} className="text-center p-6 shadow-card border-border">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Story Section */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-8">
              Our Story
            </h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-muted-foreground mb-4">
                  Founded in 2020, EcoStore emerged from a vision to create a marketplace that combines quality, 
                  affordability, and sustainability. We started as a small team with big dreams and have grown 
                  into a trusted platform serving thousands of customers.
                </p>
                <p className="text-muted-foreground">
                  Today, we continue to innovate and expand our offerings while staying true to our core values: 
                  quality, customer satisfaction, and environmental responsibility.
                </p>
              </div>
              <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg p-8 text-center">
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Growing Together
                </h3>
                <p className="text-muted-foreground">
                  Building a sustainable future, one product at a time.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border-border">
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;