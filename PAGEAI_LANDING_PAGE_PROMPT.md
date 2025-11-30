# PageAI Prompt: DesignCraft Landing Page

## Project Overview
Create a modern, professional landing page for **DesignCraft** - a powerful screenshot editing and branding tool that helps users create beautiful, branded screenshots for social media, documentation, and presentations.

---

## App Description & Key Features

**DesignCraft** is a web-based screenshot editor that allows users to:

### Core Features:
1. **Upload & Edit Screenshots**
   - Drag-and-drop or click to upload images
   - Support for multiple images on one canvas
   - Intuitive image positioning and layering

2. **Advanced Image Editing**
   - Crop images with precision (isolated area centers automatically)
   - Rotate images (90° increments)
   - Flip horizontally and vertically
   - Scale/resize with maintained aspect ratio
   - Rounded corners (adjustable border radius 0-50px)

3. **Professional Effects**
   - Shadow effects: Soft, Deep, and Glow (adjustable strength 0-100%)
   - Noise texture overlay (adjustable intensity 0-100%)
   - High-quality rendering for crisp exports

4. **Background Customization**
   - 60+ beautiful gradient presets organized by theme:
     - Aurora & Multi-color
     - Purple Tones
     - Blue Tones
     - Green Tones
     - Warm Tones
     - Neutral Tones
   - Brand-based gradients (auto-generated from brand color)
   - Solid color backgrounds
   - Auto-applies brand gradient when user has brand setup

5. **Brand Elements**
   - Add brand logo or brand name (@username style)
   - Customizable text styling (bold, italic, size, color)
   - Independent logo and text sizing
   - Drag-and-drop positioning
   - Brand settings saved for reuse

6. **Export & Sharing**
   - High-quality PNG export (Retina/4K optimized)
   - One-click download
   - Filename: "designcraft-export.png"

7. **Project Management**
   - Save and load projects
   - Auto-save functionality
   - Project title editing
   - New project creation

8. **User Experience**
   - Clean, dark-themed interface
   - Real-time preview
   - Undo/redo support
   - Delete selected or all images
   - Feedback system built-in
   - Responsive design

---

## Target Audience

### Primary Users:
- **Content Creators** - YouTubers, bloggers, social media influencers
- **Developers** - Creating documentation screenshots, GitHub README images
- **Designers** - Quick mockups and branded visuals
- **Marketers** - Social media graphics, promotional materials
- **Product Managers** - Feature announcements, product screenshots
- **Educators** - Tutorial images, course materials

### Use Cases:
- Social media posts (Twitter, LinkedIn, Instagram)
- Blog post featured images
- GitHub repository screenshots
- Product documentation
- Tutorial and how-to guides
- Portfolio presentations
- Marketing materials
- App store screenshots

---

## Design Requirements

### Brand Identity:
- **Primary Color:** Purple gradient (#8B70F6 to #9D7DFF)
- **Style:** Modern, clean, professional with a creative edge
- **Tone:** Friendly, approachable, yet powerful and professional
- **Dark Theme:** Primary interface uses dark backgrounds (#1E1E1E, #252525, #2A2A2A)

### Visual Style:
- Smooth gradients and modern UI elements
- Rounded corners (12-24px border radius)
- Subtle shadows and depth
- High contrast for readability
- Purple accent color throughout
- Clean typography (Inter, Instrument Sans, or similar)

### Layout Sections:

#### 1. **Hero Section**
- Compelling headline: "Create Beautiful, Branded Screenshots in Seconds"
- Subheadline: "Professional screenshot editing with powerful branding tools. No design skills required."
- Primary CTA: "Start Creating Free" (purple gradient button)
- Secondary CTA: "See How It Works" (outline button)
- Hero image/animation: Show the app interface or before/after screenshot examples
- Trust indicators: "No credit card required • Free forever • Export unlimited"

#### 2. **Features Showcase** (3-4 columns)
- **Smart Editing**
  - Icon: Crop/Edit icon
  - Description: "Crop, rotate, resize, and layer your images with intuitive drag-and-drop controls"
  
- **Beautiful Backgrounds**
  - Icon: Palette/Gradient icon
  - Description: "Choose from 60+ stunning gradients or create custom backgrounds that match your brand"
  
- **Brand Your Work**
  - Icon: Sparkles/Brand icon
  - Description: "Add your logo or brand name with customizable styling. Save your brand for instant reuse"
  
- **Professional Effects**
  - Icon: Magic wand/Effects icon
  - Description: "Apply shadows, rounded corners, and noise textures for that perfect polished look"

#### 3. **How It Works** (3 steps)
- **Step 1: Upload**
  - "Drag and drop your screenshots or click to upload"
  - Visual: Upload interface
  
- **Step 2: Customize**
  - "Choose backgrounds, add effects, and position your brand elements"
  - Visual: Editing interface with controls
  
- **Step 3: Export**
  - "Download your beautiful, branded screenshot in high quality"
  - Visual: Export button and result

#### 4. **Use Cases / Examples**
- Show 4-6 example screenshots created with the tool
- Categories: Social Media, Documentation, Marketing, Tutorials
- Before/after comparisons if possible
- Hover effects to show details

#### 5. **Why DesignCraft?**
- **Fast & Intuitive** - "Create professional screenshots in under 60 seconds"
- **No Design Skills Needed** - "Beautiful results without being a designer"
- **Brand Consistency** - "Save your brand settings and apply them instantly"
- **High Quality** - "Retina-ready exports that look crisp on any device"
- **Free Forever** - "All features available, no hidden costs or limits"

#### 6. **Testimonials / Social Proof** (Optional)
- If available, add user testimonials
- Usage statistics: "Join 10,000+ creators making beautiful screenshots"
- Logo wall of companies/creators using it

#### 7. **Final CTA Section**
- Headline: "Ready to Create Beautiful Screenshots?"
- Subheadline: "Join thousands of creators, developers, and marketers"
- Large CTA button: "Get Started Free"
- Secondary text: "No signup required to try"

#### 8. **Footer**
- Links: Features, Pricing (if applicable), About, Contact, Privacy, Terms
- Social media links
- Copyright notice
- "Built with ❤️ for creators"

---

## Technical Requirements

### Framework & Styling:
- **Next.js 15** (App Router)
- **React 18**
- **TailwindCSS** for styling
- **Lucide React** for icons
- Dark theme by default
- Fully responsive (mobile, tablet, desktop)

### Color Palette:
```css
Primary Purple: #8B70F6
Secondary Purple: #9D7DFF
Dark Backgrounds: #1E1E1E, #252525, #2A2A2A
Borders: #3A3A3A
Text Primary: #FFFFFF
Text Secondary: #AAAAAA
Text Muted: #666666
Success: #10B981
Error: #EF4444
```

### Typography:
- Headings: Bold, 32-64px
- Subheadings: Semibold, 20-28px
- Body: Regular, 16-18px
- Small text: 14px

### Animations:
- Smooth fade-in on scroll
- Hover effects on buttons and cards
- Gradient animations on hero section
- Subtle parallax effects (optional)

### CTAs:
- Primary button: Purple gradient background, white text, rounded-2xl
- Hover: Slightly darker gradient, scale 1.02
- Secondary button: Transparent with purple border, purple text
- All CTAs should link to `/workspace` (the main app)

### Performance:
- Optimize images (WebP format)
- Lazy load images below the fold
- Fast page load (< 2 seconds)
- Lighthouse score > 90

---

## Content Tone & Voice

### Writing Style:
- **Clear & Concise** - No jargon, easy to understand
- **Benefit-Focused** - Emphasize what users can achieve
- **Action-Oriented** - Use active verbs (Create, Transform, Design)
- **Friendly & Professional** - Approachable but credible
- **Confident** - "Create beautiful screenshots" not "Try to create"

### Example Headlines:
- "Transform Screenshots into Branded Masterpieces"
- "Professional Screenshot Editing, Made Simple"
- "Your Screenshots, Beautifully Branded"
- "Create Stunning Screenshots in Seconds"

### Example CTAs:
- "Start Creating Free"
- "Try DesignCraft Now"
- "Create Your First Screenshot"
- "Get Started - It's Free"

---

## Additional Elements

### Micro-interactions:
- Button hover states with smooth transitions
- Card lift effects on hover
- Smooth scroll animations
- Loading states for images

### Accessibility:
- ARIA labels for all interactive elements
- Keyboard navigation support
- High contrast ratios (WCAG AA compliant)
- Alt text for all images
- Focus indicators

### SEO Optimization:
- Meta title: "DesignCraft - Professional Screenshot Editor & Branding Tool"
- Meta description: "Create beautiful, branded screenshots in seconds. Free online tool with 60+ gradients, professional effects, and easy branding. No design skills required."
- Open Graph images
- Structured data markup

---

## Inspiration & References

### Similar Tools (for reference):
- Shots.so (screenshot mockups)
- Ray.so (code screenshots)
- Screely (browser mockups)
- Carbon (code sharing)

### Design Inspiration:
- Modern SaaS landing pages
- Clean, gradient-heavy designs
- Dark mode interfaces
- Product-led growth pages

---

## File Structure

Create the landing page at: `apps/web/app/page.tsx`

Use existing components where possible:
- Reuse button styles from the app
- Consistent color scheme
- Same font family

---

## Success Criteria

The landing page should:
1. ✅ Clearly communicate what DesignCraft does
2. ✅ Show the value proposition within 3 seconds
3. ✅ Have a clear, prominent CTA above the fold
4. ✅ Showcase key features with visuals
5. ✅ Build trust and credibility
6. ✅ Be fully responsive and fast
7. ✅ Convert visitors to try the app
8. ✅ Match the app's design language

---

## Notes for PageAI

- Focus on visual appeal and modern design
- Use the purple gradient prominently but tastefully
- Include smooth animations but keep performance high
- Make CTAs impossible to miss
- Show, don't just tell (use visuals and examples)
- Keep the copy concise and benefit-focused
- Ensure mobile experience is excellent
- Add subtle delighters (hover effects, animations)

---

**Goal:** Create a landing page that makes visitors immediately understand the value of DesignCraft and feel excited to try it. The page should feel modern, professional, and trustworthy while maintaining a friendly, approachable tone.
