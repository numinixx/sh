import React from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'XYZ Kumar',
      role: 'Parent of Class 10 Student',
      image: 'data\\images\\Default.jpg',
      content: 'Shakti Shanti Academy has transformed my child\'s learning experience. The teachers are incredibly dedicated and the facilities are top-notch. I couldn\'t be happier with our decision.',
      rating: 5
    },
    {
      name: 'ABC Sharma',
      role: 'Parent of Class 8 Student',
      image: 'data\\images\\Default.jpg',
      content: 'The holistic approach to education at SSA is remarkable. My daughter has not only excelled academically but has also developed strong values and confidence.',
      rating: 5
    },
    {
      name: 'PQR Patel',
      role: 'Parent of Class 12 Student',
      image: 'data\\images\\Default.jpg',
      content: 'The academic support and career guidance provided by the school have been invaluable. My son is now confident about his future and has secured admission in a premier college.',
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-white via-orange-50/20 to-yellow-50/30 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full mb-6 shadow-lg"
          >
            <Star className="w-5 h-5 text-white fill-white" />
            <span className="text-white font-semibold text-sm">Parent Testimonials</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            What Parents Say
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-yellow-600 to-amber-600">
              About Our School
            </span>
          </h2>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Don't just take our word for it. Here's what parents have to say about their experience with Shakti Shanti Academy.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-orange-200 overflow-hidden h-full flex flex-col">
                <div className="absolute top-4 right-4 text-orange-400 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                  <Quote className="w-16 h-16" />
                </div>

                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed mb-6 flex-grow italic">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-200"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>

                <div className="absolute -bottom-2 -left-2 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-block">
            <div className="flex items-center gap-3 bg-white px-8 py-4 rounded-2xl shadow-lg border-2 border-orange-100">
              <div className="flex -space-x-2">
                {testimonials.map((testimonial, index) => (
                  <img
                    key={index}
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                  />
                ))}
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">500+ Happy Parents</p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm text-gray-600">4.9/5 Average Rating</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
