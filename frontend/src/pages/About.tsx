import { motion } from "framer-motion"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Users, Shield, Zap } from "lucide-react"

export default function About() {
  const features = [
    {
      icon: Brain,
      title: "Advanced AI Models",
      description: "Access cutting-edge AI models from leading researchers and developers worldwide."
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Built by the community, for the community. Share, discover, and collaborate."
    },
    {
      icon: Shield,
      title: "Decentralized & Secure",
      description: "Powered by blockchain technology ensuring security, transparency, and ownership."
    },
    {
      icon: Zap,
      title: "Easy Integration",
      description: "Simple APIs and SDKs make it easy to integrate AI models into your applications."
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-balance">
            About AI Marketplace
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            The first decentralized marketplace for AI models, built on Web3 infrastructure 
            to democratize AI access and empower creators worldwide.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <feature.icon className="w-8 h-8 text-primary" />
                    <span>{feature.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mb-16"
        >
          <Card>
            <CardContent className="pt-8">
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground max-w-4xl mx-auto text-pretty">
                We believe AI should be accessible to everyone. Our decentralized marketplace 
                removes barriers between AI creators and users, enabling a fair, transparent, 
                and innovative ecosystem where anyone can contribute, discover, and benefit 
                from artificial intelligence.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-3xl">Built on Web3</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Polygon Network</h3>
                  <p className="text-muted-foreground">
                    Fast, secure, and low-cost blockchain infrastructure for 
                    smart contracts and transactions.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Walrus Storage</h3>
                  <p className="text-muted-foreground">
                    Decentralized storage solution for AI models ensuring 
                    data integrity and availability.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Fluence Network</h3>
                  <p className="text-muted-foreground">
                    Decentralized compute platform for running AI inference 
                    at scale across the network.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}