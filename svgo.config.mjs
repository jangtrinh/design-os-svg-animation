// Conservative pre-binding cleanup; never run path rewrites per morph keyframe.
export default {
  multipass: false,
  plugins: ['removeDoctype', 'removeXMLProcInst', 'removeComments']
};
