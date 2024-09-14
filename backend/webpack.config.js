import path from 'path';
import nodeExternals from 'webpack-node-externals';
import webpack from 'webpack';
import dotenv from 'dotenv';

dotenv.config();  // Load variables from .env

export default {
  entry: './server.js',  // Your backend entry point
  target: 'node',
  externals: [nodeExternals()],  // Exclude node_modules
  output: {
    path: path.resolve(process.cwd(), 'dist'),
    filename: 'bundle.cjs',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.MONGODB_URL': JSON.stringify(process.env.MONGODB_URL),
      'process.env.PORT': JSON.stringify(process.env.PORT),
      'process.env.JWT_SECRET': JSON.stringify(process.env.JWT_SECRET),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.CLOUDINARY_CLOUD_NAME': JSON.stringify(process.env.CLOUDINARY_CLOUD_NAME),
      'process.env.CLOUDINARY_API_KEY': JSON.stringify(process.env.CLOUDINARY_API_KEY),
      'process.env.CLOUDINARY_API_SECRET': JSON.stringify(process.env.CLOUDINARY_API_SECRET),
    }),
  ],
  mode: 'production',  // Minify and optimize
};
